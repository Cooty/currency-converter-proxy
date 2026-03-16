import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";

import currencies from "./currencies.js";
import latest from "./latest.js";

const api = new Hono();
const app = new Hono<{ Bindings: Env }>();

api.route("/currencies", currencies);
api.route("/latest", latest);

app.use(
  rateLimiter<{ Bindings: Env }>({
    binding: (c) => c.env.CC_PROXY_RATE_LIMITER,
    keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "",
  }),
);

app.route("api/", api);

export default app;
