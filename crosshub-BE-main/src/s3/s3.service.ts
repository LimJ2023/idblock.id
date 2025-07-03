import crypto from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { INJECT_S3_CLIENT } from './s3-client.provider';
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { EnvService } from 'src/env/env.service';

@Injectable()
export class S3Service {
  bucketName: string;
  region: string;

  constructor(
    @Inject(INJECT_S3_CLIENT) private s3Client: S3Client,
    private readonly envService: EnvService,
  ) {
    this.bucketName = this.envService.get('S3_BUCKET_NAME');
    this.region = this.envService.get('S3_REGION');
  }

  async uploadFile(file: Express.Multer.File, location: string = 'test/') {
    // implementation
    console.log('uploading file...');

    const randomFileName = `${location.endsWith('/') ? location : `${location}/`}${crypto.randomBytes(32).toString('hex')}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: randomFileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      url: this.getPublicObjectUrl(randomFileName),
      key: randomFileName,
    };
  }

  async uploadBuffer(
    buffer: Buffer,
    location: string = 'test/',
    mimetype: string = 'application/json',
  ) {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: location,
        Body: buffer,
        ContentType: mimetype,
      }),
    );

    return {
      url: this.getPublicObjectUrl(location),
      key: location,
    };
  }

  getPublicObjectUrl(key: string) {
    // return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

    return `${this.envService.get('PUBLIC_S3_DOMAIN')}/${key.split('/').slice(1).join('/')}`;
  }

  createPresignedUrlWithClient(key: string) {
    if (!key || key.trim() === '') {
      throw new Error('S3 key cannot be null or empty');
    }
    const command = new GetObjectCommand({ Bucket: this.bucketName, Key: key });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
