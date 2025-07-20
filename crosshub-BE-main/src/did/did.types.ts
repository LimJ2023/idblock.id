import { ApiProperty } from '@nestjs/swagger';

// W3C DID 표준을 따르는 타입 정의
export interface DidDocument {
  '@context': string[];
  id: string; // did:method:identifier
  verificationMethod: VerificationMethod[];
  authentication: string[];
  assertionMethod?: string[];
  keyAgreement?: string[];
  capabilityInvocation?: string[];
  capabilityDelegation?: string[];
  service?: ServiceEndpoint[];
  created?: string;
  updated?: string;
  controller?: string | string[];
}

export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyJwk?: JsonWebKey;
  publicKeyMultibase?: string;
  publicKeyBase58?: string;
}

export interface ServiceEndpoint {
  id: string;
  type: string;
  serviceEndpoint: string | object;
}

export interface VerifiableCredential {
  '@context': string[];
  type: string[];
  issuer: string | { id: string };
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: any;
  proof: Proof;
}

export interface Proof {
  type: string;
  created: string;
  verificationMethod: string;
  proofPurpose: string;
  proofValue: string;
}

export interface VerifiablePresentation {
  '@context': string[];
  type: string[];
  holder: string;
  verifiableCredential: VerifiableCredential[];
  proof: Proof;
}

// DID 생성 요청 DTO
export class CreateDidDto {
  @ApiProperty({
    description: '사용자 이름',
    example: '김철수',
  })
  name: string;

  @ApiProperty({
    description: '이메일',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: '서비스 엔드포인트 (선택사항)',
    example: 'https://example.com/profile',
    required: false,
  })
  serviceEndpoint?: string;
}

// VC 발행 요청 DTO
export class IssueCredentialDto {
  @ApiProperty({
    description: 'DID 식별자',
    example: 'did:idblock:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
  })
  subjectDid: string;

  @ApiProperty({
    description: '자격증명 타입',
    example: 'IdentityCredential',
  })
  credentialType: string;

  @ApiProperty({
    description: '자격증명 데이터',
    example: {
      id: 'did:idblock:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
      name: '김철수',
      birthDate: '1990-01-01',
      nationality: 'KR',
      verified: true,
    },
  })
  credentialSubject: any;
}

// DID 해결 응답 타입
export interface DidResolutionResult {
  didDocument: DidDocument | null;
  didDocumentMetadata: any;
  didResolutionMetadata: {
    contentType?: string;
    error?: string;
  };
} 