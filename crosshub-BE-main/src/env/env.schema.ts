import * as v from 'valibot';

export const EnvSchema = v.object({
  STAGE: v.picklist(['LOCAL', 'DEVELOPMENT', 'PRODUCTION']),
  PORT: v.pipe(
    v.string(),
    v.transform<string, number>((input) => parseInt(input, 10)),
  ),
  DATABASE_URL: v.pipe(v.string(), v.url()),
  JWT_SECRET: v.string(),
  API_SCOPE: v.picklist(['PUBLIC', 'ADMIN', 'MANAGER', 'EXTERNAL_API', 'TRANSACTION']),
  ACCESS_KEY: v.string(),
  SECRET_ACCESS_KEY: v.string(),
  S3_REGION: v.string(),
  S3_BUCKET_NAME: v.string(),
  RESEND_API_KEY: v.string(),
  COOKIE_DOMAIN: v.string(),
  PUBLIC_S3_DOMAIN: v.string(),

  THIRDWEB_CLIENT: v.string(),
  THIRDWEB_SECRET: v.string(),
  ADMIN_WALLET: v.string(),

  ARGOS_API_KEY: v.string(),
  ANDROID_MIN_VERSION: v.string(),
  IOS_MIN_VERSION: v.string(),

  TMP_PG_URL: v.string(),
  TMP_MARIA_URL: v.string(),

  GCP_PROJECT_ID: v.string(),
  GOOGLE_APPLICATION_CREDENTIALS: v.string(),
  GCS_BUCKET_NAME: v.string(),
  PUBLIC_GCS_DOMAIN: v.string(),
  GCS_PUBLIC_BUCKET_NAME: v.string(),
});

export type TEnv = v.InferOutput<typeof EnvSchema>;
