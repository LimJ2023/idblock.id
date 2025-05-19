import crypto from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { INJECT_GCS } from './gcs-client.provider';
import { Storage } from '@google-cloud/storage';
import { EnvService } from 'src/env/env.service';

@Injectable()
export class GcsService {
  private bucketName: string;
  private publicBucketName: string;
  private publicDomain: string;

  constructor(
    @Inject(INJECT_GCS) private readonly storage: Storage,
    private readonly env: EnvService,
  ) {
    this.bucketName = this.env.get('GCS_BUCKET_NAME');
    this.publicBucketName = this.env.get('GCS_PUBLIC_BUCKET_NAME');
    this.publicDomain = this.env.get('PUBLIC_GCS_DOMAIN');
  }

  /** Private 버킷에 파일 업로드 */
  async uploadPrivateFile(
    file: Express.Multer.File,
    location = 'private/',
  ): Promise<{ url: string; key: string }> {
    const randomFileName = `${
      location.endsWith('/') ? location : `${location}/`
    }${crypto.randomBytes(32).toString('hex')}`;

    await this.storage
      .bucket(this.bucketName)
      .file(randomFileName)
      .save(file.buffer, {
        contentType: file.mimetype,
        resumable: false,
      });

    return {
      url: this.getPrivateObjectUrl(randomFileName),
      key: randomFileName,
    };
  }

  /** Public 버킷에 파일 업로드 */
  async uploadPublicFile(
    file: Express.Multer.File,
    location = 'public/',
  ): Promise<{ url: string; key: string }> {
    const randomFileName = `${
      location.endsWith('/') ? location : `${location}/`
    }${crypto.randomBytes(32).toString('hex')}`;

    await this.storage
      .bucket(this.publicBucketName)
      .file(randomFileName)
      .save(file.buffer, {
        contentType: file.mimetype,
        resumable: false,
      });

    return {
      url: this.getPublicObjectUrl(randomFileName),
      key: randomFileName,
    };
  }

  /** Private 버킷에 버퍼 업로드 */
  async uploadPrivateBuffer(
    buffer: Buffer,
    location = 'private/',
    mimetype = 'application/json',
  ) {
    await this.storage
      .bucket(this.bucketName)
      .file(location)
      .save(buffer, { contentType: mimetype, resumable: false });
    return { url: this.getPrivateObjectUrl(location), key: location };
  }

  /** Public 버킷에 버퍼 업로드 */
  async uploadPublicBuffer(
    buffer: Buffer,
    location = 'public/',
    mimetype = 'application/json',
  ) {
    await this.storage
      .bucket(this.publicBucketName)
      .file(location)
      .save(buffer, { contentType: mimetype, resumable: false });
    return { url: this.getPublicObjectUrl(location), key: location };
  }

  /** Private 버킷의 파일에 대한 서명된 URL 생성 */
  async createPresignedUrlWithClient(key: string, expiresSec = 900) {
    const [url] = await this.storage
      .bucket(this.bucketName)
      .file(key)
      .getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + expiresSec * 1000,
      });
    return url;
  }

  /** Public 버킷의 파일 URL 생성 */
  getPublicObjectUrl(key: string) {
    return `${this.publicDomain}/${key.replace(/^.*?\//, '')}`;
  }

  /** Private 버킷의 파일 URL 생성 */
  getPrivateObjectUrl(key: string) {
    return `${this.bucketName}/${key.replace(/^.*?\//, '')}`;
  }
}
