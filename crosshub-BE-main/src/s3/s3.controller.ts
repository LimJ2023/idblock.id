import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileUploadDto } from './s3.dto';
import { Public } from 'src/auth/auth.guard';
import { S3Service } from './s3.service';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  // @Public()
  // @Post('test')
  // @UseInterceptors(FileInterceptor('file'))
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   description: '파일 업로드',
  //   type: FileUploadDto,
  // })
  // async uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   return await this.s3Service.uploadFile(file);
  // }
}
