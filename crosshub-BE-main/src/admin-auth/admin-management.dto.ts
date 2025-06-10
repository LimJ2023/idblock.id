import { ApiProperty } from '@nestjs/swagger';
import { VEmail, VName, VPassword } from 'src/common/common.dto';
import { TypeschemaDto } from 'src/lib/typeschema';
import { AdminPermission } from 'src/database/schema/admin-user';
import * as v from 'valibot';

const VCreateAdminDto = v.object({
  email: VEmail,
  password: VPassword,
  name: VName,
  permission: v.picklist([AdminPermission.ROOT, AdminPermission.MIDDLE, AdminPermission.GENERAL]),
});

export class CreateAdminDto extends TypeschemaDto(VCreateAdminDto) {
  @ApiProperty({
    title: '이메일',
    description: '관리자 이메일',
    example: 'admin@example.com',
  })
  email: string;

  @ApiProperty({
    title: '비밀번호',
    description: '관리자 비밀번호',
    example: 'password123',
  })
  password: string;

  @ApiProperty({
    title: '이름',
    description: '관리자 이름',
    example: '관리자',
  })
  name: string;

  @ApiProperty({
    title: '권한',
    description: '관리자 권한 (1: 루트, 2: 중간, 3: 일반)',
    example: AdminPermission.GENERAL,
    enum: AdminPermission,
  })
  permission: AdminPermission;
}

const VUpdateAdminPermissionDto = v.object({
  permission: v.picklist([AdminPermission.ROOT, AdminPermission.MIDDLE, AdminPermission.GENERAL]),
});

export class UpdateAdminPermissionDto extends TypeschemaDto(VUpdateAdminPermissionDto) {
  @ApiProperty({
    title: '권한',
    description: '변경할 관리자 권한 (1: 루트, 2: 중간, 3: 일반)',
    example: AdminPermission.MIDDLE,
    enum: AdminPermission,
  })
  permission: AdminPermission;
} 