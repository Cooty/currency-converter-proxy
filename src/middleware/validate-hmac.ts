import { createMiddleware } from "hono/factory";

function normalizeQuery(params: URLSearchParams) {
  return [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");
}

function buildCanonicalString(input: {
  method: string;
  path: string;
  query: string;
  timestamp: string;
  bodyHash?: string;
}) {
  return [
    input.method.toUpperCase(),
    input.path,
    input.query,
    input.timestamp,
    input.bodyHash ?? "",
  ].join("\n");
}

function bufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return diff === 0;
}

async function signCanonicalString(secret: string, canonical: string) {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(canonical),
  );

  return bufferToBase64(signature);
}

export const verifyHmac = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    const timestamp = c.req.header("x-timestamp");
    const providedSignature = c.req.header("x-signature");

    if (!timestamp || !providedSignature) {
      return c.json({ message: "Missing signature headers" }, 401);
    }

    const timeStampAsNumber = Number(timestamp);
    if (!Number.isFinite(timeStampAsNumber)) {
      return c.json({ message: "Invalid timestamp" }, 401);
    }

    // Accept request if:
    // server_time - client_time| ≤ MAX_CLOCK_SKEW_SECONDS
    const now = Math.floor(Date.now() / 1000);
    const MAX_CLOCK_SKEW_SECONDS = 300; // 5 minutes

    if (Math.abs(now - timeStampAsNumber) > MAX_CLOCK_SKEW_SECONDS) {
      return c.json({ message: "Expired timestamp" }, 401);
    }

    const url = new URL(c.req.url);

    const canonical = buildCanonicalString({
      method: c.req.method,
      path: url.pathname,
      query: normalizeQuery(url.searchParams),
      timestamp,
    });

    const expectedSignature = await signCanonicalString(
      c.env.SIGNATURE_SECRET,
      canonical,
    );

    if (!timingSafeEqual(providedSignature, expectedSignature)) {
      return c.json({ message: "Invalid signature" }, 401);
    }

    await next();
  },
);
