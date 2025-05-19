import { ApiProperty } from '@nestjs/swagger';
import { TypeschemaDto } from 'src/lib/typeschema';
import * as v from 'valibot';

// export const toNumber = z.number().or(z.string()).pipe(z.coerce.number());
// export const toBigInt = z.bigint().or(toNumber).pipe(z.coerce.bigint());

const USER_STATUS = ['OPENED', 'APPROVED', 'REJECTED', 'REOPENED'] as const;
export type TUserStatus = (typeof USER_STATUS)[number];

const VQueryUserDto = v.object({
  status: v.optional(v.picklist(USER_STATUS), 'OPENED'),
});

export class QueryUserDto extends TypeschemaDto(VQueryUserDto) {
  @ApiProperty({
    title: '상태',
    description: '상태',
    example: 'OPENED',
    default: 'OPENED',
    enum: USER_STATUS,
  })
  status?: 'OPENED' | 'APPROVED' | 'REJECTED' | 'REOPENED';
}

const VApproveUserDto = v.object({
  documentId: v.pipe(
    v.union([v.number(), v.string()]),
    v.transform((input) => BigInt(input)),
  ),
});

export class UserVerificationDocumetDetailDto extends TypeschemaDto(
  v.object({
    documentId: v.pipe(
      v.string(),
      v.transform((s) => BigInt(s)),
    ),
  }),
) {
  @ApiProperty({
    title: '문서 ID',
    description: '문서 ID',
    example: '1',
  })
  documentId: bigint;
}

export class ApproveUserDto extends TypeschemaDto(VApproveUserDto) {
  @ApiProperty({
    title: '문서 ID',
    description: '문서 ID',
    example: 1,
  })
  documentId: bigint;
}
export class RejectUserDto extends TypeschemaDto(
  v.intersect([VApproveUserDto, v.object({ reason: v.string() })]),
) {
  @ApiProperty({
    title: '문서 ID',
    description: '문서 ID',
    example: 1,
  })
  documentId: bigint;

  @ApiProperty({
    title: '사유',
    description: '사유',
    example: '사유',
  })
  reason: string;
}
