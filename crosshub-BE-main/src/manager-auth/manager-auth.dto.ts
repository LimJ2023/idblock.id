import { ApiProperty } from '@nestjs/swagger';
import { VEmail, VName, VPassword } from 'src/common/common.dto';
import { TypeschemaDto } from 'src/lib/typeschema';
import * as v from 'valibot';

const VSignUpDto = v.object({
  email: VEmail,
  password: VPassword,
  name: VName,
});

export class ManagerSignUpDto extends TypeschemaDto(VSignUpDto) {
  @ApiProperty({
    title: '이메일',
    description: '이메일',
    example: 'hello@buttersoft.io',
  })
  email: string;

  @ApiProperty({
    title: '비밀번호',
    description: '비밀번호',
    example: '12345678',
  })
  password: string;

  @ApiProperty({
    title: '이름',
    description: '이름',
    example: '홍길동',
  })
  name: string;
}
const VLoginDto = v.object({
  email: VEmail,
  password: VPassword,
});

export type TManagerLoginDto = v.InferOutput<typeof VLoginDto>;
export class ManagerLoginDto extends TypeschemaDto(VLoginDto) {
  @ApiProperty({
    title: '이메일',
    description: '이메일',
    example: 'hello@buttersoft.io',
  })
  email: string;

  @ApiProperty({
    title: '비밀번호',
    description: '비밀번호',
    example: '12345678',
  })
  password: string;
}
