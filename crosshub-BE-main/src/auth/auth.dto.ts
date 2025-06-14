import { ApiProperty } from '@nestjs/swagger';
import { createInsertSchema } from 'drizzle-valibot';
import { refreshToken } from 'firebase-admin/app';
import {
  VBirthday,
  VDi,
  VEmail,
  VName,
  VPassword,
} from 'src/common/common.dto';
import { User } from 'src/database/schema';
import { TypeschemaDto } from 'src/lib/typeschema';
import * as v from 'valibot';

const VRequestEmailVerificationDto = v.object({
  email: VEmail,
});

export class RequestEmailVerificationDto extends TypeschemaDto(
  VRequestEmailVerificationDto,
) {
  @ApiProperty({
    title: '이메일',
    description: '이메일',
    example: 'hkchae@buttersoft.io',
  })
  email: string;
}
export class ConfirmEmailVerificationDto extends TypeschemaDto(
  v.intersect([
    VRequestEmailVerificationDto,
    v.object({ code: v.string(), uuid: v.pipe(v.string(), v.uuid()) }),
  ]),
) {
  @ApiProperty({
    title: '이메일',
    description: '이메일',
    example: 'hkchae@buttersoft.io',
  })
  email: string;

  @ApiProperty({
    title: '인증 코드',
    description: '인증 코드',
    example: '123456',
  })
  code: string;

  @ApiProperty({
    title: 'UUID',
    description: 'UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  uuid: string;
}

const VDeleteEmailVerificationDto = v.object({
  email: VEmail,
});

export class DeleteEmailVerificationDto extends TypeschemaDto(
  VDeleteEmailVerificationDto,
) {
  @ApiProperty({
    title: '이메일',
    description: '이메일',
    example: 'hkchae@buttersoft.io',
  })
  email: string;
}

const VStep1Veification = v.object({
  birthday: VBirthday,
  passportNumber: v.string(),
});
export class Step1VerificationDto extends TypeschemaDto(VStep1Veification) {
  @ApiProperty({
    title: '생년월일',
    description: '생년월일',
    example: '19900101',
  })
  birthday: string;

  @ApiProperty({
    title: '여권 번호',
    description: '여권 번호',
    example: '12345678',
  })
  passportNumber: string;
}
const VSignupSimpleDto = v.object({
  email: VEmail,
  password: VPassword
})
const VSignUpDto = v.pipe(
  v.object({
    uuid: v.pipe(v.string(), v.uuid()),
    email: VEmail,
    password: VPassword,
    passwordCheck: v.string(),
    name: VName,
    birthday: VBirthday,
    countryCode: v.string(),
    cityId: v.string(),
    passportNumber: v.string(),
    passportImageKey: v.string(),
    profileImageKey: v.string(),
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['passwordCheck']],
      (input) => input.password === input.passwordCheck,
      'The two passwords do not match.',
    ),
    ['passwordCheck'],
  ),
);
export class SignupSimpleDto extends TypeschemaDto(VSignupSimpleDto) {
  @ApiProperty({
    title: '이메일',
    description: '이메일',
    example: 'heuristic2022@gmail.com',
    required: true,
  })
  email: string;
  @ApiProperty({
    title: '비밀번호',
    description: '비밀번호',
    example: '12345678',
    required: true
  })
  password: string;
}
export class SignUpDto extends TypeschemaDto(VSignUpDto) {
  @ApiProperty({
    title: 'UUID',
    description: '이메일 인증시 사용한 UUID',
    example: '812204a0-2432-40e0-90cb-b1ad8019b9c1',
  })
  uuid: string;

  @ApiProperty({
    title: '이메일',
    description: '이메일',
    example: 'heuristic2022@gmail.com',
  })
  email: string;

  @ApiProperty({
    title: '비밀번호',
    description: '비밀번호',
    example: '12345678',
  })
  password: string;
  @ApiProperty({
    title: '비밀번호 확인',
    description: '비밀번호 확인',
    example: '12345678',
  })
  passwordCheck: string;

  @ApiProperty({
    title: '이름',
    description: '이름',
    example: '임요한',
  })
  name: string;

  @ApiProperty({
    title: '생년월일',
    description: '생년월일',
    example: '19940501',
  })
  birthday: string;

  @ApiProperty({
    title: '국가',
    description: '국가',
    example: 'KR',
  })
  countryCode: string;

  @ApiProperty({
    title: '도시 id',
    description: '도시 id',
    example: '1835848',
  })
  cityId: string;

  @ApiProperty({
    title: '여권 번호',
    description: '여권 번호',
    example: 'm12345678',
  })
  passportNumber: string;

  @ApiProperty({
    title: '여권 이미지 키',
    description: '여권 이미지 키',
    example:
      'private/passport/9cfd74bb7e8280e15139d1e142c0f96ccf23e9bb684f20ea62d084f505fa140f',
  })
  passportImageKey: string;

  @ApiProperty({
    title: '프로필 이미지 키',
    description: '프로필 이미지 키',
    example:
      'private/profile/1005aa23b5e4f2ca0e448345741cefc35aaa0eed639673ec134de5898ddf18a5',
  })
  profileImageKey: string;

  @ApiProperty({
    title: "승인유형",
    description: "승인유형",
    example: null,
  })
  approvalId: string | null;
}

const VDeleteUserDto = v.object({
  email: VEmail,
});

export class DeleteUserDto extends TypeschemaDto(VDeleteUserDto) {
  @ApiProperty({
    title: '이메일',
    description: '이메일',
    example: 'heuristic2022@gmail.com',
  })
  email: string;
}

const VLoginDto = v.object({
  email: VEmail,
  password: VPassword,
});

export type TLoginDto = v.InferOutput<typeof VLoginDto>;

export class LoginDto extends TypeschemaDto(VLoginDto) {
  @ApiProperty({
    title: '이메일',
    description: '이메일',
    example: 'hkchae@buttersoft.io',
  })
  email: string;

  @ApiProperty({
    title: '비밀번호',
    description: '비밀번호',
    example: '12345678',
  })
  password: string;
}
export const insertUserSchema = createInsertSchema(User);

const VUpdateInfoDto = v.object({
  name: VName,
  birthday: VBirthday,
  countryCode: v.string(),
  cityId: v.string(),
  passportNumber: v.string(),
  passportImageKey: v.string(),
  profileImageKey: v.string(),
});

export type TUpdateInfoDto = v.InferOutput<typeof VUpdateInfoDto>;
export class UpdateInfoDto extends TypeschemaDto(VUpdateInfoDto) {
  @ApiProperty({
    title: '이름',
    description: '이름',
    example: '홍길동',
  })
  name: string;

  @ApiProperty({
    title: '생년월일',
    description: '생년월일',
    example: '19900101',
  })
  birthday: string;

  @ApiProperty({
    title: '국가',
    description: '국가',
    example: 'KR',
  })
  countryCode: string;

  @ApiProperty({
    title: '도시 id',
    description: '도시 id',
    example: '1835848',
  })
  cityId: string;

  @ApiProperty({
    title: '여권 번호',
    description: '여권 번호',
    example: '12345678',
  })
  passportNumber: string;

  @ApiProperty({
    title: '여권 이미지 키',
    description: '여권 이미지 키',
    example:
      'private/passport/c4da74d81d1414f7d8df9133dbfc6a686800c3a0993ee55e9deb9bf73a60362e',
  })
  passportImageKey: string;

  @ApiProperty({
    title: '프로필 이미지 키',
    description: '프로필 이미지 키',
    example:
      'private/profile/6d60d03bb9497e4478d33d1ba40d8e285beaada2a2e39f4388194fbb866d6662',
  })
  profileImageKey: string;
}

const VResetPasswordDto = v.object({
  password: VPassword,
  passwordCheck: v.string(),
  uuid: v.pipe(v.string(), v.uuid()),
});
export class ResetPaswordDto extends TypeschemaDto(VResetPasswordDto) {
  @ApiProperty({
    title: 'UUID',
    description: '이메잃 인증시 사용한 UUID',
    example: '812204a0-2432-40e0-90cb-b1ad8019b9c1',
  })
  uuid: string;

  @ApiProperty({
    title: '비밀번호',
    description: '비밀번호',
    example: '12345678',
  })
  password: string;
  @ApiProperty({
    title: '비밀번호 확인',
    description: '비밀번호 확인',
    example: '12345678',
  })
  passwordCheck: string;
}

const VRefreshToken = v.object({
  refreshToken: v.string(),
});

export class RefreshTokenDto extends TypeschemaDto(VRefreshToken) {
  @ApiProperty({
    title: '리프레시 토큰',
    description: '리프레시 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5',
  })
  refreshToken: string;
}

export class GetQrCodeDto {
  @ApiProperty({
    title: '유저 아이디',
    description: '유저 아이디',
    example: 122,
  })
  userId: bigint;
}