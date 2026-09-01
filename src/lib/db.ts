import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

/**
 * Connects to MongoDB using a cached connection across hot-reloads and
 * serverless invocations. Throws a clear error if MONGODB_URI is missing so
 * callers can surface a friendly "service unavailable" message instead of a
 * raw stack trace.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Add it to your .env.local file (see .env.example)."
    );
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
      })
      .then((m) => m);
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }

  return cache.conn;
}

/** Convenience wrapper: connects and returns the native driver's Db handle (used for GridFS). */
export async function getDb() {
  const conn = await connectToDatabase();
  if (!conn.connection.db) {
    throw new Error("Database connection is not ready.");
  }
  return conn.connection.db;
}

export default connectToDatabase;
