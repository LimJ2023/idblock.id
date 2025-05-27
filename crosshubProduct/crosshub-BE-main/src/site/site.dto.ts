import { ApiProperty } from '@nestjs/swagger';
import { VEmail, VPassword } from 'src/common/common.dto';
import { TypeschemaDto } from 'src/lib/typeschema';
import * as v from 'valibot';

const VSite = v.object({
  name: v.string(),
  imageKey: v.string(),
  address: v.string(),
  description: v.string(),
});
const VCreateSiteDto = v.pipe(
  v.object({
    ...VSite.entries,
    email: VEmail,
    password: VPassword,
    passwordCheck: v.string(),
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

export class CreateSiteDto extends TypeschemaDto(VCreateSiteDto) {
  @ApiProperty({
    description: '이름',
    example: '경복궁',
  })
  name: string;
  @ApiProperty({
    description: '이미지 키',
    example:
      'public/site/thumbnail/6563d4f02870c136e1ddb87820b51aed87974db5788b35eb831dc07a644fd087',
  })
  imageKey: string;
  @ApiProperty({
    description: '주소',
    example: '서울특별시 종로구 사직로 161',
  })
  address: string;
  @ApiProperty({
    description: '설명',
    example: '조선 시대의 궁궐로, 서울특별시 종로구에 위치하고 있다.',
  })
  description: string;

  @ApiProperty({
    description: '이메일',
    example: 'site1@manager.com',
  })
  email: string;

  @ApiProperty({
    description: '비밀번호',
    example: '12345678',
  })
  password: string;
  @ApiProperty({
    description: '비밀번호 확인',
    example: '12345678',
  })
  passwordCheck: string;
}
export class UpdateSiteDto extends TypeschemaDto(VCreateSiteDto) {
  @ApiProperty({
    description: '이름',
    example: '경복궁',
  })
  name: string;
  @ApiProperty({
    description: '이미지 키',
    example:
      'public/site/thumbnail/6563d4f02870c136e1ddb87820b51aed87974db5788b35eb831dc07a644fd087',
  })
  imageKey: string;
  @ApiProperty({
    description: '주소',
    example: '서울특별시 종로구 사직로 161',
  })
  address: string;
  @ApiProperty({
    description: '설명',
    example: '조선 시대의 궁궐로, 서울특별시 종로구에 위치하고 있다.',
  })
  description: string;

  @ApiProperty({
    description: '이메일',
    example: 'site1@manager.com',
  })
  email: string;

  @ApiProperty({
    description: '비밀번호',
    example: '12345678',
  })
  password: string;
  @ApiProperty({
    description: '비밀번호 확인',
    example: '12345678',
  })
  passwordCheck: string;
}

const VcreateVisitDto = v.object({
  siteId: v.pipe(
    v.number(),
    v.transform((input) => BigInt(input)),
  ),
});

export class CreateVisitSiteDto extends TypeschemaDto(VcreateVisitDto) {
  @ApiProperty({
    description: '사이트 ID',
    example: 1,
  })
  siteId: bigint;
}

const VCreateReviewDSto = v.object({
  // visitId: v.pipe(
  //   v.number(),
  //   v.transform((input) => BigInt(input)),
  // ),
  content: v.string(),
});

export class CreateReviewDto extends TypeschemaDto(VCreateReviewDSto) {
  // @ApiProperty({
  //   description: '방문 ID',
  //   example: 1,
  // })
  // visitId: bigint;
  @ApiProperty({
    description: '내용',
    example: '좋아요',
  })
  content: string;
}
