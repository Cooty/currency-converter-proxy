import { Hono } from "hono/tiny";

import { apiClient } from "./api-client.js";

const app = new Hono();

app.get("/", async (c) => {
  try {
    const resp = await apiClient.currencies();
    return c.json(resp);
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Internal Server Error";
    return c.json({ message }, 500);
  }
});

export default app;
