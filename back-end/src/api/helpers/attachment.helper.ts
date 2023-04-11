import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import config from "../../config";

const s3 = new S3Client({
  credentials: {
    accessKeyId: config.s3Bucket.secretKey,
    secretAccessKey: config.s3Bucket.secretAccessKey,
  },
  region: config.s3Bucket.region,
});

export interface ObjectData {
  fileName?: string;
  buffer: Buffer;
  mimeType?: string;
}

const createPutObjectCommand = async (data: ObjectData) => {
  const command = new PutObjectCommand({
    Bucket: config.s3Bucket.name,
    Key: data.fileName,
    Body: data.buffer,
    ContentType: data.mimeType,
  });

  await s3.send(command);
};

// : TODO:
const createDeleteObjectCommand = async (path: string) => {
  const command = new DeleteObjectCommand({
    Bucket: config.s3Bucket.name,
    Key: `${path}.pdf`,
  });

  await s3.send(command);
};

const createGetObjectCommand = async (path: string) => {
  const command = new GetObjectCommand({
    Bucket: config.s3Bucket.name,
    Key: `${path}.pdf`,
  });

  // : TODO: check expiration time
  const url = await getSignedUrl(s3, command, { expiresIn: 60 * 60 * 5 });

  return url;
};

export {
  createPutObjectCommand,
  createDeleteObjectCommand,
  createGetObjectCommand,
};
