import { ApiProperty } from '@nestjs/swagger';
import { TypeschemaDto } from 'src/lib/typeschema';
import * as v from 'valibot';
const fcmTokenUpdateDto = v.object({
  fcmToken: v.string(),
});

export class FcmTokenUpdateDto extends TypeschemaDto(fcmTokenUpdateDto) {
  @ApiProperty({
    title: 'fcmToken',
    description: 'fcmToken',
    example: 'fcmToken',
  })
  fcmToken: string;
}
