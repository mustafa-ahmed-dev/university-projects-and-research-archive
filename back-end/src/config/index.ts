import dotenv from "dotenv/config";

export interface Config {
  api: {
    port: number;
    env: string;
    secretKey: string;
    page: number;
    minPageSize: number;
    maxPageSize: number;
  };
  hostName: string;
  jwtPrivateKey: string;
  s3Bucket: {
    name: string;
    region: string;
    secretKey: string;
    secretAccessKey: string;
  };
  sentryDsn: string;
}

const config: Config = {
  api: {
    port: Number(process.env.API_PORT),
    env: String(process.env.API_ENV),
    secretKey: String(process.env.API_SECRET_KEY),
    page: Number(process.env.API_DEFAULT_PAGE),
    minPageSize: Number(process.env.API_MIN_PAGE_SIZE),
    maxPageSize: Number(process.env.API_MAX_PAGE_SIZE),
  },
  hostName: String(process.env.HOST_NAME),
  jwtPrivateKey: String(process.env.JWT_PRIVATE_KEY),
  s3Bucket: {
    name: String(process.env.AWS_BUCKET_NAME),
    region: String(process.env.AWS_BUCKET_REGION),
    secretKey: String(process.env.AWS_SECRET_KEY),
    secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY),
  },
  sentryDsn: String(process.env.SENTRY_DSN),
};

export default config;
