import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';
import { generateKeyPairSync, sign, verify } from 'crypto';
import { DrizzleDB, INJECT_DRIZZLE } from 'src/database/drizzle.provider';
import {
  DidDocument,
  VerifiableCredential,
  VerificationMethod,
  ServiceEndpoint,
  Proof,
  DidResolutionResult,
  CreateDidDto,
  IssueCredentialDto,
} from './did.types';

@Injectable()
export class DidService {
  constructor(
    @Inject(INJECT_DRIZZLE) private readonly db: DrizzleDB,
  ) {}

  /**
   * 새로운 DID 생성
   */
  async createDid(createDidDto: CreateDidDto): Promise<{
    did: string;
    didDocument: DidDocument;
    privateKey: string;
  }> {
    // 1. 키 쌍 생성 (Ed25519) - PEM 형식 사용으로 호환성 개선
    const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    // 2. PEM 공개키를 Buffer로 변환
    const publicKeyBuffer = this.pemToBuffer(publicKey);
    
    // 3. DID 식별자 생성 (multibase 인코딩)
    const identifier = this.generateDidIdentifier(publicKeyBuffer);
    const did = `did:idblock:${identifier}`;

    // 4. Verification Method 생성
    const verificationMethod: VerificationMethod = {
      id: `${did}#key-1`,
      type: 'Ed25519VerificationKey2020',
      controller: did,
      publicKeyMultibase: this.encodeMultibase(publicKeyBuffer),
    };

    // 4. Service Endpoint 설정 (선택사항)
    const services: ServiceEndpoint[] = [];
    if (createDidDto.serviceEndpoint) {
      services.push({
        id: `${did}#profile`,
        type: 'ProfileService',
        serviceEndpoint: createDidDto.serviceEndpoint,
      });
    }

    // 5. DID Document 생성
    const didDocument: DidDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1',
      ],
      id: did,
      verificationMethod: [verificationMethod],
      authentication: [verificationMethod.id],
      assertionMethod: [verificationMethod.id],
      capabilityInvocation: [verificationMethod.id],
      service: services.length > 0 ? services : undefined,
      created: new Date().toISOString(),
    };

    // 6. 데이터베이스에 저장 (실제 구현에서는 분산 저장소 사용)
    await this.storeDid(did, didDocument, createDidDto);

    return {
      did,
      didDocument,
      privateKey: privateKey, // PEM 형식으로 반환
    };
  }

  /**
   * DID 해결 (resolve)
   */
  async resolveDid(did: string): Promise<DidResolutionResult> {
    try {
      // DID 형식 검증
      if (!this.isValidDidFormat(did)) {
        return {
          didDocument: null,
          didDocumentMetadata: {},
          didResolutionMetadata: {
            error: 'invalidDid',
          },
        };
      }

      // 저장소에서 DID Document 조회
      const didDocument = await this.retrieveDid(did);

      if (!didDocument) {
        return {
          didDocument: null,
          didDocumentMetadata: {},
          didResolutionMetadata: {
            error: 'notFound',
          },
        };
      }

      return {
        didDocument,
        didDocumentMetadata: {
          created: didDocument.created,
          updated: didDocument.updated,
        },
        didResolutionMetadata: {
          contentType: 'application/did+ld+json',
        },
      };
    } catch (error) {
      return {
        didDocument: null,
        didDocumentMetadata: {},
        didResolutionMetadata: {
          error: 'internalError',
        },
      };
    }
  }

  /**
   * Verifiable Credential 발행
   */
  async issueCredential(
    issuerDid: string,
    issuerPrivateKey: string,
    issueCredentialDto: IssueCredentialDto,
  ): Promise<VerifiableCredential> {
    // 1. 발행자 DID 검증
    const issuerResolution = await this.resolveDid(issuerDid);
    if (!issuerResolution.didDocument) {
      throw new BadRequestException('발행자 DID가 존재하지 않습니다.');
    }

    // 2. 주체 DID 검증
    const subjectResolution = await this.resolveDid(issueCredentialDto.subjectDid);
    if (!subjectResolution.didDocument) {
      throw new BadRequestException('주체 DID가 존재하지 않습니다.');
    }

    // 3. VC 생성
    const now = new Date();
    const credential: VerifiableCredential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://idblock.id/credentials/v1',
      ],
      type: ['VerifiableCredential', issueCredentialDto.credentialType],
      issuer: issuerDid,
      issuanceDate: now.toISOString(),
      expirationDate: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1년
      credentialSubject: issueCredentialDto.credentialSubject,
      proof: await this.createProof(
        {
          '@context': [
            'https://www.w3.org/2018/credentials/v1',
            'https://idblock.id/credentials/v1',
          ],
          type: ['VerifiableCredential', issueCredentialDto.credentialType],
          issuer: issuerDid,
          issuanceDate: now.toISOString(),
          expirationDate: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          credentialSubject: issueCredentialDto.credentialSubject,
        },
        issuerDid,
        issuerPrivateKey,
      ),
    };

    return credential;
  }

  /**
   * Verifiable Credential 검증
   */
  async verifyCredential(credential: VerifiableCredential): Promise<boolean> {
    try {
      // 1. 발행자 DID 해결
      const issuerDid = typeof credential.issuer === 'string' 
        ? credential.issuer 
        : credential.issuer.id;
      
      const issuerResolution = await this.resolveDid(issuerDid);
      if (!issuerResolution.didDocument) {
        return false;
      }

      // 2. 검증 방법 조회
      const verificationMethod = issuerResolution.didDocument.verificationMethod.find(
        vm => vm.id === credential.proof.verificationMethod
      );

      if (!verificationMethod) {
        return false;
      }

      // 3. 서명 검증
      const { proof, ...credentialWithoutProof } = credential;
      return this.verifyProof(credentialWithoutProof, proof, verificationMethod);
    } catch (error) {
      console.error('VC 검증 오류:', error);
      return false;
    }
  }

  // === 유틸리티 메서드들 ===

  private pemToBuffer(pem: string): Buffer {
    // PEM 헤더/푸터 제거하고 Base64 디코드
    const base64 = pem
      .replace(/-----BEGIN.*-----/g, '')
      .replace(/-----END.*-----/g, '')
      .replace(/\s+/g, '');
    return Buffer.from(base64, 'base64');
  }

  private bufferToPem(buffer: Buffer, keyType: string): string {
    // Buffer를 Base64로 인코딩하고 PEM 형식으로 래핑
    const base64 = buffer.toString('base64');
    const lines = base64.match(/.{1,64}/g) || [];
    return `-----BEGIN ${keyType}-----\n${lines.join('\n')}\n-----END ${keyType}-----`;
  }

  private generateDidIdentifier(publicKey: Buffer): string {
    const hash = createHash('sha256').update(publicKey).digest();
    return this.encodeMultibase(hash);
  }

  private encodeMultibase(data: Buffer): string {
    // z = base58btc multibase prefix
    return 'z' + this.base58Encode(data);
  }

  private base58Encode(buffer: Buffer): string {
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let num = BigInt('0x' + buffer.toString('hex'));
    let encoded = '';

    while (num > 0) {
      const remainder = num % 58n;
      num = num / 58n;
      encoded = alphabet[Number(remainder)] + encoded;
    }

    // Handle leading zeros
    for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
      encoded = '1' + encoded;
    }

    return encoded;
  }

  private isValidDidFormat(did: string): boolean {
    return /^did:idblock:[a-zA-Z0-9]+$/.test(did);
  }

  private async createProof(
    data: any,
    signerDid: string,
    privateKey: string,
  ): Promise<Proof> {
    const canonicalized = JSON.stringify(data, Object.keys(data).sort());
    const hash = createHash('sha256').update(canonicalized).digest();
    
    // PEM 형식의 개인키를 직접 사용
    const signature = sign(null, hash, privateKey);

    return {
      type: 'Ed25519Signature2020',
      created: new Date().toISOString(),
      verificationMethod: `${signerDid}#key-1`,
      proofPurpose: 'assertionMethod',
      proofValue: signature.toString('base64'),
    };
  }

  private async verifyProof(
    data: any,
    proof: Proof,
    verificationMethod: VerificationMethod,
  ): Promise<boolean> {
    try {
      const canonicalized = JSON.stringify(data, Object.keys(data).sort());
      const hash = createHash('sha256').update(canonicalized).digest();
      
      if (!verificationMethod.publicKeyMultibase) {
        return false;
      }

      // multibase로 인코딩된 공개키를 Buffer로 변환
      const publicKeyBytes = this.decodeMultibase(verificationMethod.publicKeyMultibase);
      
      // Buffer를 PEM 형식으로 변환
      const publicKeyPem = this.bufferToPem(publicKeyBytes, 'PUBLIC KEY');
      const signature = Buffer.from(proof.proofValue, 'base64');

      return verify(null, hash, publicKeyPem, signature);
    } catch (error) {
      console.error('Proof verification error:', error);
      return false;
    }
  }

  private decodeMultibase(encoded: string): Buffer {
    if (!encoded.startsWith('z')) {
      throw new Error('지원하지 않는 multibase 인코딩');
    }
    return this.base58Decode(encoded.slice(1));
  }

  private base58Decode(encoded: string): Buffer {
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let num = 0n;
    
    for (const char of encoded) {
      const index = alphabet.indexOf(char);
      if (index === -1) throw new Error('잘못된 base58 문자');
      num = num * 58n + BigInt(index);
    }

    const hex = num.toString(16);
    return Buffer.from(hex.length % 2 ? '0' + hex : hex, 'hex');
  }

  // 임시 저장소 메서드들 (실제로는 IPFS, 블록체인 등 사용)
  private didStorage = new Map<string, DidDocument>();
  private didMetadata = new Map<string, any>();

  private async storeDid(did: string, didDocument: DidDocument, metadata: any): Promise<void> {
    this.didStorage.set(did, didDocument);
    this.didMetadata.set(did, metadata);
  }

  private async retrieveDid(did: string): Promise<DidDocument | null> {
    return this.didStorage.get(did) || null;
  }
} 