import { SignJWT, jwtVerify } from "jose";

const ADMIN_COOKIE = "ctfi_admin_session";
const GALLERY_COOKIE_PREFIX = "ctfi_gallery_";
const ADMIN_SESSION_HOURS = 12;
const GALLERY_SESSION_HOURS = 24;

function getSecret(name: string): Uint8Array {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Add it to your .env.local file (see .env.example).`
    );
  }
  return new TextEncoder().encode(value);
}

function adminSecret() {
  return getSecret("ADMIN_SESSION_SECRET");
}

function gallerySecret() {
  return getSecret("GALLERY_SESSION_SECRET");
}

export interface AdminSessionPayload {
  sub: string; // AdminUser _id
  email: string;
  name: string;
  role: "owner" | "admin";
}

export async function createAdminSessionToken(payload: AdminSessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_HOURS}h`)
    .sign(adminSecret());
}

export async function verifyAdminSessionToken(
  token: string
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, adminSecret());
    return payload as unknown as AdminSessionPayload;
  } catch {
    return null;
  }
}

export interface GallerySessionPayload {
  galleryId: string;
  scope: "gallery";
}

export async function createGallerySessionToken(
  galleryId: string,
  expiresInSeconds: number
) {
  return new SignJWT({ galleryId, scope: "gallery" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(gallerySecret());
}

export async function verifyGallerySessionToken(
  token: string
): Promise<GallerySessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, gallerySecret());
    if (payload.scope !== "gallery" || typeof payload.galleryId !== "string") {
      return null;
    }
    return payload as unknown as GallerySessionPayload;
  } catch {
    return null;
  }
}

export function adminCookieName() {
  return ADMIN_COOKIE;
}

export function galleryCookieName(galleryId: string) {
  return `${GALLERY_COOKIE_PREFIX}${galleryId}`;
}

export const ADMIN_SESSION_MAX_AGE = ADMIN_SESSION_HOURS * 60 * 60;
export const GALLERY_SESSION_MAX_AGE = GALLERY_SESSION_HOURS * 60 * 60;
