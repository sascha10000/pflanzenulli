import * as Minio from "minio";

const endpoint = process.env.MINIO_ENDPOINT || "localhost";
const port = parseInt(process.env.MINIO_PORT || "9000", 10);
const accessKey = process.env.MINIO_ROOT_USER || "minioadmin";
const secretKey = process.env.MINIO_ROOT_PASSWORD || "minioadmin";
const useSSL = process.env.MINIO_USE_SSL === "true";
const bucket = process.env.MINIO_BUCKET || "pflanzenulli";

let client: Minio.Client | undefined;

export function getStorageClient(): Minio.Client {
  if (!client) {
    client = new Minio.Client({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }
  return client;
}

export function getBucket(): string {
  return bucket;
}

export async function ensureBucket(): Promise<void> {
  const storage = getStorageClient();
  const exists = await storage.bucketExists(bucket);
  if (!exists) {
    await storage.makeBucket(bucket);
  }
}
