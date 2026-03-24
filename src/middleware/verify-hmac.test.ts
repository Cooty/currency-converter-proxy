import { describe, it, expect, beforeEach, afterEach } from "@jest/globals"
import { Hono } from "hono"

import { verifyHmac } from "./verify-hmac.js"
import {
  signCanonicalString,
  buildCanonicalString,
  normalizeQuery
} from "../lib/signing/index.js"

describe("verifyHmac middleware", () => {
  const SIGNATURE_SECRET =
    "1150e906dab5cde3d0da0dbaa2ff775d3a5eadcf5ef894adee7ed08788b2d386"
  const realDateNow = Date.now

  beforeEach(() => {
    Date.now = () => 1774268680 * 1000
  })

  afterEach(() => {
    Date.now = realDateNow
  })

  // Returns the app used for testing our middleware
  function makeApp() {
    const app = new Hono<{ Bindings: Env }>()

    app.use("/protected", verifyHmac)

    app.get("/protected", (c) => {
      return c.json({ it: "works" })
    })

    return app
  }

  // this is what should run on the client to sign the request
  async function makeSignedHeaders(url: string, method: string = "GET") {
    const timestamp = String(Math.floor(Date.now() / 1000))
    const parsed = new URL(url)

    const canonical = buildCanonicalString({
      method,
      path: parsed.pathname,
      query: normalizeQuery(parsed.searchParams),
      timestamp
    })

    const signature = await signCanonicalString(SIGNATURE_SECRET, canonical)

    return {
      "x-timestamp": timestamp,
      "x-signature": signature
    }
  }

  it("allows a valid signed request", async () => {
    const app = makeApp()
    const url = "https://example.com/protected?sort=asc&auth=false&query=Foo"
    const headers = await makeSignedHeaders(url)

    const res = await app.request(
      url,
      {
        method: "GET",
        headers
      },
      { SIGNATURE_SECRET } as Env
    )

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ it: "works" })
  })

  it("rejects requests without signature", async () => {
    const app = makeApp()
    const url = "https://example.com/protected?sort=asc&auth=false&query=Foo"

    const res = await app.request(
      url,
      {
        method: "GET"
      },
      { SIGNATURE_SECRET } as Env
    )

    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual({
      message: "Missing signature headers"
    })
  })

  it("rejects invalid timestamp", async () => {
    const app = makeApp()

    const res = await app.request(
      "https://example.com/protected",
      {
        method: "GET",
        headers: {
          "x-timestamp": "not-a-number",
          "x-signature": "anything"
        }
      },
      { SIGNATURE_SECRET } as Env
    )

    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual({
      message: "Invalid timestamp"
    })
  })

  it("rejects expired timestamp", async () => {
    const app = makeApp()

    const res = await app.request(
      "https://example.com/protected",
      {
        method: "GET",
        headers: {
          "x-timestamp": "1774265749", // more than 300s old vs frozen time
          "x-signature": "anything"
        }
      },
      { SIGNATURE_SECRET } as Env
    )

    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual({
      message: "Expired timestamp"
    })
  })

  it("rejects invalid signature", async () => {
    const app = makeApp()

    const res = await app.request(
      "https://example.com/protected",
      {
        method: "GET",
        headers: {
          "x-timestamp": "1774268440",
          "x-signature": "definitely-wrong"
        }
      },
      { SIGNATURE_SECRET } as Env
    )

    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual({
      message: "Invalid signature"
    })
  })
})
