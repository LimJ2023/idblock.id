import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommonService } from './common.service';
import { Public } from 'src/auth/auth.guard';
import { CountryCodeDto, DeviceOsDto } from './common.dto';
import { Response } from 'express';

@ApiTags('공통')
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Public()
  @Get('country')
  getCountryList() {
    return this.commonService.getCountryList();
  }

  @Public()
  @Get('city')
  getCityList(@Query() q: CountryCodeDto) {
    return this.commonService.getCityList(q.data.countryCode);
  }

  @Public()
  @Get('term-of-service')
  getTermOfService() {
    return this.commonService.getTermOfService();
  }
  @Public()
  @Get('html/term-of-service')
  getTermOfServiceHtml(@Res() res: Response) {
    return res.render('IDBLOCK_term', {});
  }
  @Public()
  @Get('privacy-policy')
  getPrivacyPolicy() {
    return this.commonService.getPrivacyPolicy();
  }
  @Public()
  @Get('html/privacy-policy')
  getPrivacyPolicyHtml(@Res() res: Response) {
    return res.render('IDBLOCK_privacy_policy', {});
  }

  @Public()
  @Get('versions')
  getVersions(@Query() q: DeviceOsDto) {
    return this.commonService.getVersion(q.data.deviceType);
  }
}
