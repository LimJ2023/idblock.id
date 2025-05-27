import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import {
  ApiProperty,
  ApiResponse,
  ApiResponseSchemaHost,
  getSchemaPath,
} from '@nestjs/swagger';
import { TypeschemaDto } from 'src/lib/typeschema';
import * as v from 'valibot';

export const VDataWrapper = (input: v.ObjectSchema<any, any>) =>
  v.object({ data: input });

export const VDi = v.pipe(v.string(), v.nonEmpty('Please enter your DI.'));

export const VEmail = v.pipe(
  v.string(),
  v.nonEmpty('Please enter your email.'),
  v.email('The email is badly formatted.'),
);

export const VPassword = v.pipe(
  v.string(),
  v.nonEmpty('Please enter your password.'),
  v.minLength(8, 'Your password is too short.'),
);

export const VName = v.pipe(v.string(), v.nonEmpty('Please enter your name.'));

export const VBirthday = v.pipe(
  v.string(),
  v.nonEmpty('Please enter a valid number.'),
);

const VCountryCode = v.object({ countryCode: v.string() });

export class CountryCodeDto extends TypeschemaDto(VCountryCode) {
  @ApiProperty({
    title: '국가 코드',
    description: '국가 코드',
    example: 'KR',
  })
  countryCode: string;
}

const VDeviceOs = v.object({ deviceType: v.picklist(['ANDROID', 'IOS']) });
export class DeviceOsDto extends TypeschemaDto(VDeviceOs) {
  @ApiProperty({
    title: 'Device OS',
  })
  deviceType: string;
}

export class ApiDataResponse<T> {
  @ApiProperty()
  data: T;
}
export const ApiResponseData = <TModel extends Type<any>>(
  status: HttpStatus = HttpStatus.OK,
  model: TModel,
) => {
  return applyDecorators(
    ApiResponse({
      status,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiDataResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
};

export const ApiDuplicateHttpExceptionResponse = <TModel extends Type<any>>(
  status: HttpStatus = HttpStatus.BAD_REQUEST,
  ...models: TModel[]
) => {
  return applyDecorators(
    ApiResponse({
      status,
      schema: {
        oneOf: models.map((model) => ({
          $ref: getSchemaPath(model),
        })),
      },
    }),
  );
};
