import { GridFSBucket, ObjectId } from "mongodb";
import { getDb } from "./db";

const BUCKET_NAME = "media";

export async function getBucket(): Promise<GridFSBucket> {
  const db = await getDb();
  return new GridFSBucket(db, { bucketName: BUCKET_NAME });
}

/** Streams a Buffer into GridFS and returns the new file's ObjectId. */
export async function uploadBuffer(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<ObjectId> {
  const bucket = await getBucket();
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: { contentType },
    });
    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(uploadStream.id as ObjectId));
    uploadStream.end(buffer);
  });
}

export async function downloadToBuffer(id: ObjectId): Promise<Buffer> {
  const bucket = await getBucket();
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    const downloadStream = bucket.openDownloadStream(id);
    downloadStream.on("data", (chunk) => chunks.push(chunk));
    downloadStream.on("error", reject);
    downloadStream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

export async function deleteFile(id: ObjectId): Promise<void> {
  const bucket = await getBucket();
  try {
    await bucket.delete(id);
  } catch {
    // Already gone — treat as success so admin deletes are idempotent.
  }
}

export { ObjectId };
