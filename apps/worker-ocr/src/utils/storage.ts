import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { config } from '@resume-hub/config';
import { logger } from '@resume-hub/logger';

const s3 = new S3Client({
  region: 'us-east-1',
  endpoint: config.minio.endpoint,
  credentials: {
    accessKeyId: config.minio.accessKey,
    secretAccessKey: config.minio.secretKey,
  },
  forcePathStyle: true,
});

export const downloadResumeBuffer = async (minioPath: string): Promise<Buffer> => {
  const cleanKey = minioPath.replace(/^\/?(files\/)?/, '');

  logger.info(
    `Attempting to download S3 Object Key: ${cleanKey} from Bucket: ${config.minio.bucket}`,
  );

  const command = new GetObjectCommand({
    Bucket: config.minio.bucket,
    Key: cleanKey,
  });

  const response = await s3.send(command);

  if (!response.Body) {
    throw new Error('File body is empty or null');
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};
