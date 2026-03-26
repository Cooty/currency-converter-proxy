import { createMiddleware } from "hono/factory"

import {
  buildCanonicalString,
  normalizeQuery,
  signCanonicalString
} from "../lib/signing/index.js"
import { timingSafeEqual } from "../lib/crypto/time-safe-equal.js"

import { logRequest } from "../utils/logging.js"

export const verifyHmac = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    const timestamp = c.req.header("x-timestamp")
    const providedSignature = c.req.header("x-signature")

    if (!timestamp || !providedSignature) {
      logRequest("Missing headers", c.req)
      return c.json({ message: "Missing signature headers" }, 401)
    }

    const timeStampAsNumber = Number(timestamp)
    if (!Number.isFinite(timeStampAsNumber)) {
      logRequest("Invalid timestamp", c.req)
      return c.json({ message: "Invalid timestamp" }, 401)
    }

    // Accept request if:
    // server_time - client_time| ≤ MAX_CLOCK_SKEW_SECONDS
    const now = Math.floor(Date.now() / 1000)
    const MAX_CLOCK_SKEW_SECONDS = 300 // 5 minutes

    if (Math.abs(now - timeStampAsNumber) > MAX_CLOCK_SKEW_SECONDS) {
      logRequest("Expired timestamp", c.req)
      return c.json({ message: "Expired timestamp" }, 401)
    }

    const url = new URL(c.req.url)

    const canonical = buildCanonicalString({
      method: c.req.method,
      path: url.pathname,
      query: normalizeQuery(url.searchParams),
      timestamp
    })

    const expectedSignature = await signCanonicalString(
      c.env.SIGNATURE_SECRET,
      canonical
    )

    if (!timingSafeEqual(providedSignature, expectedSignature)) {
      logRequest("Invalid signature", c.req)
      return c.json({ message: "Invalid signature" }, 401)
    }

    await next()
  }
)
