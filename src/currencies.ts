import { Hono } from "hono/tiny";

import { getApiClient } from "./api-client.js";

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  try {
    const apiClient = getApiClient(c.env.API_KEY);
    const resp = await apiClient.currencies();
    return c.json(resp);
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Internal Server Error";
    return c.json({ message }, 500);
  }
});

export default app;
