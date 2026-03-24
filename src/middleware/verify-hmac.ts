import { createMiddleware } from "hono/factory"

import {
  buildCanonicalString,
  normalizeQuery,
  signCanonicalString
} from "../lib/signing/index.js"
import { timingSafeEqual } from "../lib/crypto/time-safe-equal.js"

export const verifyHmac = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    const timestamp = c.req.header("x-timestamp")
    const providedSignature = c.req.header("x-signature")

    if (!timestamp || !providedSignature) {
      return c.json({ message: "Missing signature headers" }, 401)
    }

    const timeStampAsNumber = Number(timestamp)
    if (!Number.isFinite(timeStampAsNumber)) {
      return c.json({ message: "Invalid timestamp" }, 401)
    }

    // Accept request if:
    // server_time - client_time| ≤ MAX_CLOCK_SKEW_SECONDS
    const now = Math.floor(Date.now() / 1000)
    const MAX_CLOCK_SKEW_SECONDS = 300 // 5 minutes

    if (Math.abs(now - timeStampAsNumber) > MAX_CLOCK_SKEW_SECONDS) {
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
      return c.json({ message: "Invalid signature" }, 401)
    }

    await next()
  }
)
