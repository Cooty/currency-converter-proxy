import { Hono } from "hono/tiny"

import { getApiClient } from "./lib/freecurrencyapi/api-client.js"

import { logException } from "./utils/logging.js"

const app = new Hono<{ Bindings: Env }>()

app.get("/", async (c) => {
  try {
    const apiClient = getApiClient(c.env.API_KEY)
    const resp = await apiClient.currencies()
    return c.json(resp)
  } catch (e) {
    logException(e, c.req)
    const message = e instanceof Error ? e.message : "Internal Server Error"
    return c.json({ message }, 500)
  }
})

export default app
