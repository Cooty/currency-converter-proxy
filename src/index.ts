import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";

import currencies from "./currencies.js";
import latest from "./latest.js";

function getClientIp(
  c: Parameters<typeof rateLimiter>[0] extends never ? never : any,
) {
  // If you're behind Nginx / a load balancer / a platform proxy,
  // prefer the forwarded header that your infra sets correctly.
  const xff = c.req.header("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0]!.trim();
  }

  // Fallback for direct connections / some runtimes
  return "unknown";
}

const limiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 60, // 60 requests per minute per IP
  standardHeaders: "draft-6", // adds RateLimit-* headers
  keyGenerator: (c) => getClientIp(c),
  handler: (c) => {
    return c.json({ error: "Too many requests" }, 429);
  },
});

const app = new Hono();
const api = new Hono();

api.route("/currencies", currencies);
api.route("/latest", latest);

app.use("api/*", limiter);

app.route("api/", api);

export default app;
