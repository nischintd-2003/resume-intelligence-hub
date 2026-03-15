import fs from 'fs';
import os from 'os';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
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

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const downloadResumeToFile = async (minioPath: string): Promise<string> => {
  const cleanKey = minioPath.replace(/^\/?(files\/)?/, '');
  const tmpPath = path.join(
    os.tmpdir(),
    `resume-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  logger.info(`Downloading S3 key "${cleanKey}" from bucket "${config.minio.bucket}" → ${tmpPath}`);

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const command = new GetObjectCommand({
        Bucket: config.minio.bucket,
        Key: cleanKey,
      });

      const response = await s3.send(command);

      if (!response.Body) {
        throw new Error('S3 response body is empty');
      }

      const writeStream = fs.createWriteStream(tmpPath);
      await pipeline(response.Body as Readable, writeStream);

      logger.info(`Download complete (attempt ${attempt}): ${tmpPath}`);
      return tmpPath;
    } catch (err: any) {
      lastError = err;
      logger.warn(`Download attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);

      await fs.promises.unlink(tmpPath).catch(() => {});

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw new Error(
    `Failed to download "${cleanKey}" after ${MAX_RETRIES} attempts: ${lastError?.message}`,
  );
};
