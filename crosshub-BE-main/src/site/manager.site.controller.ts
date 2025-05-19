import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Manager 관광지')
@Controller('site')
export class ManagerSiteController {
  constructor() {}
}
