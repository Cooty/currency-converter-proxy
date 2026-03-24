import { Hono } from "hono"
import { rateLimiter } from "hono-rate-limiter"

import currencies from "./currencies.js"
import latest from "./latest.js"

import { verifyHmac } from "./middleware/verify-hmac.js"

const api = new Hono()
const app = new Hono<{ Bindings: Env }>()

api.route("/currencies", currencies)
api.route("/latest", latest)

app.use(
  "/api/v1/*",
  rateLimiter<{ Bindings: Env }>({
    binding: (c) => c.env.CC_PROXY_RATE_LIMITER,
    keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? ""
  })
)

app.use("*", async (c, next) => {
  console.log(
    JSON.stringify({
      method: c.req.method,
      url: c.req.url,
      userAgent: c.req.header("user-agent") ?? "unknown",
      connectingIP: c.req.header("cf-connecting-ip") ?? "unknown",
      clientVersion: c.req.header("x-client-version") ?? "unknown",
      clientPlatform: c.req.header("x-client-platform") ?? "unknown"
    })
  )
  await next()
})

app.use("/api/v1/*", verifyHmac)

app.route("/api/v1", api)

export default app
