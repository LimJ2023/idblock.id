import { SetMetadata } from '@nestjs/common';
import { AdminPermission } from 'src/database/schema/admin-user';

export const ADMIN_PERMISSION_KEY = 'admin_permission';
export const RequireAdminPermission = (permission: AdminPermission) =>
  SetMetadata(ADMIN_PERMISSION_KEY, permission); 