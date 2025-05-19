import { ApiProperty } from "@nestjs/swagger";
import { TypeschemaDto } from "src/lib/typeschema";
import * as v from 'valibot';


export class CreateApiKeyDto extends TypeschemaDto(v.object({
    appName: v.string(),
})) {
    @ApiProperty({
        description: '앱 이름',
        example: 'crosshub',
    })
    appName: string;
    @ApiProperty({
        title: 'api key',
        description: 'api key',
        example: '1234567890',
    })
    key: string;
}

export class GetApiKeyDto extends TypeschemaDto(v.object({
    key: v.string(),
})) {
    @ApiProperty({
        description: 'api key',
        example: '1234567890',
    })
    key: string;
}

export class GetAllApiKeysDto extends TypeschemaDto(v.object({})) {
    @ApiProperty({
        description: '모든 api key 조회',
        example: '1234567890'
    })
    key: string;
}

export class DeleteApiKeyDto extends TypeschemaDto(v.object({
    key: v.string(),
})) {
    @ApiProperty({
        description: 'api key',
        example: '1234567890',
    })
    key: string;
} 