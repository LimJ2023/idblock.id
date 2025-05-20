import { ApiProperty } from '@nestjs/swagger';
import { TypeschemaDto } from 'src/lib/typeschema';
import * as v from 'valibot';

const VLoginResponse = v.object({
  accessToken: v.string(),
  refreshToken: v.string(),
});

export class LoginResponse extends TypeschemaDto(VLoginResponse) {
  @ApiProperty({
    title: '액세스 토큰',
    description: '액세스 토큰',
    example: 'eyJhbGci',
  })
  accessToken: string;

  @ApiProperty({
    title: '리프레시 토큰',
    description: '리프레시 토큰',
    example: 'eyJhbGci',
  })
  refreshToken: string;
}

const VEmailVerificationRequest = v.object({
  email: v.string(),
  uuid: v.string(),
  createdAt: v.date(),
});

export class EmailVerificationRequest extends TypeschemaDto(
  VEmailVerificationRequest,
) {
  @ApiProperty({
    title: '이메일',
    description: '이메일',
    example: 'test@email.com',
  })
  email: string;

  @ApiProperty({
    title: 'UUID',
    description: 'UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uuid: string;

  @ApiProperty({
    title: '생성일',
    description: '생성일',
    example: '2023-10-01T12:34:56.789Z',
  })
  createdAt: Date;
}

const VAlradyUsedrDto = v.object({
  message: v.string(),
});

export class AlreadyUserDto extends TypeschemaDto(VAlradyUsedrDto) {
  @ApiProperty({
    example: '이미 가입된 이메일입니다.',
  })
  message: string;
}

const VArgosRecognitionResponse = v.object({
  result: v.object({
    data: v.object({
      raw: v.any(),
      ocr: v.any(), 
    }),
  }),
});

export class ArgosRecognitionResponse extends TypeschemaDto(VArgosRecognitionResponse) {
  result: {
    data: {
      raw: any;
      ocr: any;
    };
  };
}
