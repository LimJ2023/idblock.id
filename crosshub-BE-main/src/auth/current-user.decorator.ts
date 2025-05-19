import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type JwtCurrentUser = {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: string;
};
export const CurrentUser = createParamDecorator<number>(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return (request.user as JwtCurrentUser).user_id;
  },
);
