import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DidService } from './did.service';
import {
  CreateDidDto,
  IssueCredentialDto,
  DidDocument,
  VerifiableCredential,
  DidResolutionResult,
} from './did.types';
import { Public } from 'src/auth/auth.guard';

@Controller('did')
@ApiTags('DID (분산신원)')
export class DidController {
  constructor(private readonly didService: DidService) {}

  @Public()
  @Post('create')
  @ApiOperation({
    summary: 'DID 생성',
    description: '새로운 분산신원(DID)을 생성합니다. Ed25519 키 쌍과 DID Document를 생성하여 반환합니다.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'DID 생성 성공',
    schema: {
      type: 'object',
      properties: {
        did: {
          type: 'string',
          example: 'did:idblock:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
          description: '생성된 DID 식별자',
        },
        didDocument: {
          type: 'object',
          description: 'W3C DID Document 표준을 따르는 DID 문서',
        },
        privateKey: {
          type: 'string',
          description: '개인키 (안전하게 보관 필요)',
        },
      },
    },
  })
  async createDid(@Body() createDidDto: CreateDidDto) {
    try {
      const result = await this.didService.createDid(createDidDto);
      return {
        success: true,
        data: result,
        message: 'DID가 성공적으로 생성되었습니다.',
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: 'DID 생성 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Public()
  @Get('resolve/:did')
  @ApiOperation({
    summary: 'DID 해결 (resolve)',
    description: 'DID 식별자를 통해 DID Document를 조회합니다.',
  })
  @ApiParam({
    name: 'did',
    description: 'DID 식별자',
    example: 'did:idblock:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'DID 해결 성공',
    schema: {
      type: 'object',
      properties: {
        didDocument: {
          type: 'object',
          description: 'DID Document (없으면 null)',
        },
        didDocumentMetadata: {
          type: 'object',
          description: 'DID Document 메타데이터',
        },
        didResolutionMetadata: {
          type: 'object',
          description: 'DID 해결 메타데이터',
        },
      },
    },
  })
  async resolveDid(@Param('did') did: string): Promise<DidResolutionResult> {
    // URL 디코딩 처리
    const decodedDid = decodeURIComponent(did);
    return this.didService.resolveDid(decodedDid);
  }

  @Public()
  @Post('credentials/issue')
  @ApiOperation({
    summary: 'Verifiable Credential 발행',
    description: '검증 가능한 자격증명(VC)을 발행합니다.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'VC 발행 성공',
    schema: {
      type: 'object',
      properties: {
        credential: {
          type: 'object',
          description: 'W3C Verifiable Credential 표준을 따르는 자격증명',
        },
      },
    },
  })
  async issueCredential(
    @Body() body: {
      issuerDid: string;
      issuerPrivateKey: string;
      credentialData: IssueCredentialDto;
    },
  ) {
    try {
      const credential = await this.didService.issueCredential(
        body.issuerDid,
        body.issuerPrivateKey,
        body.credentialData,
      );

      return {
        success: true,
        data: { credential },
        message: 'Verifiable Credential이 성공적으로 발행되었습니다.',
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: 'VC 발행 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Public()
  @Post('credentials/verify')
  @ApiOperation({
    summary: 'Verifiable Credential 검증',
    description: '검증 가능한 자격증명(VC)의 유효성을 검증합니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'VC 검증 완료',
    schema: {
      type: 'object',
      properties: {
        isValid: {
          type: 'boolean',
          description: '검증 결과',
        },
        details: {
          type: 'object',
          description: '검증 세부 정보',
        },
      },
    },
  })
  async verifyCredential(
    @Body() body: { credential: VerifiableCredential },
  ) {
    try {
      const isValid = await this.didService.verifyCredential(body.credential);

      return {
        success: true,
        data: {
          isValid,
          credential: body.credential,
          verifiedAt: new Date().toISOString(),
        },
        message: isValid 
          ? 'Verifiable Credential이 유효합니다.' 
          : 'Verifiable Credential이 유효하지 않습니다.',
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: 'VC 검증 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Public()
  @Get('demo/example')
  @ApiOperation({
    summary: 'DID 시스템 데모',
    description: 'DID 생성부터 VC 발행까지의 전체 워크플로우를 보여주는 데모입니다.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '데모 실행 성공',
  })
  async demo() {
    try {
      // 1. 발행자 DID 생성
      const issuer = await this.didService.createDid({
        name: 'IDBLOCK 발행기관',
        email: 'yhlim@crosshub.kr',
        serviceEndpoint: 'https://idblock.id/api/v1/did/credentials/issue',
      });

      // 2. 사용자 DID 생성
      const user = await this.didService.createDid({
        name: '임요한',
        email: 'yhlim@crosshub.kr',
      });

      // 3. VC 발행
      const credential = await this.didService.issueCredential(
        issuer.did,
        issuer.privateKey,
        {
          subjectDid: user.did,
          credentialType: 'IdentityCredential',
          credentialSubject: {
            id: user.did,
            name: '임요한',
            birthDate: '1994-05-01',
            nationality: 'KR',
            verified: true,
            verificationDate: new Date().toISOString(),
          },
        },
      );

      // 4. VC 검증
      const isValid = await this.didService.verifyCredential(credential);

      return {
        success: true,
        data: {
          input: {
            issuer_did: issuer.did,
            user_did: user.did,
            credential: credential,
            verification_result: isValid,
          },
          demo_explanation: {
            step1: '발행기관의 DID를 생성했습니다.',
            step2: '사용자의 DID를 생성했습니다.',
            step3: '발행기관이 사용자에게 신원인증 VC를 발행했습니다.',
            step4: '발행된 VC의 유효성을 검증했습니다.',
          },
        },
        message: 'DID 시스템 데모가 성공적으로 완료되었습니다.',
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: '데모 실행 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
} 