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
  import { FileUploadDto } from './gcs.dto';
  import { Public } from 'src/auth/auth.guard';
import { GcsService } from './gcs.service';
  
  @Controller('gcs')
  export class S3Controller {
    constructor(private readonly gcsService: GcsService) {}
  
    @Public()
    @Post('test')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      description: 'gcs 파일 업로드',
      type: FileUploadDto,
    })
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
      return await this.gcsService.uploadPrivateFile(file);
    }
    @Public()
    @Post('publicTest')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      description: 'gcs 파일 업로드',
      type: FileUploadDto,
    })
    async uploadPublicFile(@UploadedFile() file: Express.Multer.File) {
      return await this.gcsService.uploadPublicFile(file);
    }
  }
  