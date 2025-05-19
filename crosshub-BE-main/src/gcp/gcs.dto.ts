import { ApiProperty } from '@nestjs/swagger';
import { TypeschemaDto } from 'src/lib/typeschema';
import * as v from 'valibot';

const VFileUploadDto = v.object({
  file: v.any(),
});

export class FileUploadDto extends TypeschemaDto(VFileUploadDto) {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    title: '파일',
    description: '파일',
  })
  file: any;
}
