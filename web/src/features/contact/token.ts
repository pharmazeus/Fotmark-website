import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const CONTACT_MIN_AGE_MS = 3_000;
export const CONTACT_MAX_AGE_MS = 2 * 60 * 60 * 1_000;

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createContactToken(secret: string, now = Date.now()) {
  const payload = `${now}.${randomBytes(12).toString("base64url")}`;
  return `${payload}.${signature(payload, secret)}`;
}

export type TokenResult =
  | { ok: true }
  | { ok: false; reason: "malformed" | "signature" | "too-fast" | "expired" };

export function verifyContactToken(
  token: string,
  secret: string,
  now = Date.now(),
): TokenResult {
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed" };
  const [timestamp, nonce, provided] = parts;
  const issuedAt = Number(timestamp);
  if (!timestamp || !nonce || !provided || !Number.isFinite(issuedAt)) {
    return { ok: false, reason: "malformed" };
  }

  const expected = signature(`${timestamp}.${nonce}`, secret);
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return { ok: false, reason: "signature" };
  }

  const age = now - issuedAt;
  if (age < CONTACT_MIN_AGE_MS) return { ok: false, reason: "too-fast" };
  if (age > CONTACT_MAX_AGE_MS) return { ok: false, reason: "expired" };
  return { ok: true };
}
