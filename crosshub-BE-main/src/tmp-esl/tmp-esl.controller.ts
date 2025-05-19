import { Controller, Get, Query } from '@nestjs/common';
import { TmpEslService } from './tmp-esl.service';
import { Public } from 'src/auth/auth.guard';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('tmp-esl')
@ApiTags('임시 ESL 컨트롤러')
export class TmpEslController {
  constructor(private readonly tmpEslService: TmpEslService) {}

  @Public()
  @Get('esl')
  @ApiOperation({ summary: '단일 ESL 검색 API' })
  @ApiQuery({
    name: 'code',
    description: 'ESL 코드',
    required: true,
    type: String,
    example: 'ED100083B299-1',
  })
  async getCode(@Query('code') code: string) {
    return this.tmpEslService.getEslCode(code);
  }

  @Public()
  @Get('esl/search')
  @ApiOperation({ summary: '단일 ESL 리스트 검색 API' })
  @ApiQuery({
    name: 'code',
    description: 'ESL 코드',
    required: true,
    type: String,
    example: 'ED100083B',
  })
  async getCodeList(@Query('code') code: string) {
    return this.tmpEslService.getEslCodeList(code);
  }

  @Public()
  @Get('sku')
  @ApiOperation({ summary: '단일 상품 검색 API' })
  @ApiQuery({
    name: 'code',
    description: 'SKU 코드',
    required: true,
    type: String,
    example: '0000040122281',
  })
  async getSkuByCode(@Query('code') code: string) {
    return this.tmpEslService.getExactSKU(code);
  }

  @Public()
  @Get('sku/search')
  @ApiOperation({ summary: '상품 리스트 검색 API - 상품 코드' })
  @ApiQuery({
    name: 'code',
    description: 'SKU 코드',
    required: true,
    type: String,
    example: '000004012',
  })
  async searchSkuByCode(@Query('code') code: string) {
    return this.tmpEslService.searchBySKUCode(code);
  }

  @Public()
  @Get('sku/search-name')
  @ApiOperation({ summary: '상품 리스트 검색 API - 상품 명' })
  @ApiQuery({
    name: 'name',
    description: '상품명',
    required: true,
    type: String,
    example: '퀴네 발사믹 드레싱 250ml',
  })
  async searchSkuByName(@Query('name') name: string) {
    return this.tmpEslService.searchBySkuNmae(name);
  }
}
