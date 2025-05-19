import {
  applyDecorators,
  Controller,
  Get,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/auth.guard';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { ApiDataResponse } from './common/common.dto';

// @ApiTags(
//   process.env.API_SCOPE === 'PUBLIC'
//     ? '🚀 전체 사용자 API'
//     : process.env.API_SCOPE === 'ADMIN'
//       ? '🔐 관리자  API'
//       : process.env.API_SCOPE === 'MANAGER'
//         ? '🕌 관광지 관리자 API'
//         : '',
// )
@Public()
@Controller({
  version: [VERSION_NEUTRAL],
})
@ApiExtraModels(ApiDataResponse)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }
}
