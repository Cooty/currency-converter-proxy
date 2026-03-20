import { Hono } from "hono/tiny";

import { getApiClient } from "./api-client.js";
import { currencyCodes } from "./data/currency-codes.js";

function isValidCurrencyCode(code: string) {
  return currencyCodes.includes(code);
}

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
  const base = c.req.query("base_currency");
  const currencies = c.req.query("currencies");
  const requiredParams = { base_currency: base, currencies };

  const missingParams: string[] = [];
  Object.entries(requiredParams).filter((entry) => {
    if (entry[1] === undefined) {
      missingParams.push(entry[0]);
    }
  });

  if (missingParams.length > 0) {
    const moreMissingParams = missingParams.length > 1;
    return c.json(
      {
        message: `The following required parameter${moreMissingParams ? "s" : ""} ${moreMissingParams ? "are" : "is"} missing: ${missingParams.join(", ")}`,
      },
      400,
    );
  }

  if (base === undefined || currencies === undefined) {
    return c.json(
      {
        message: "Invalid parameters!",
      },
      400,
    );
  }

  if (!isValidCurrencyCode(base) || !isValidCurrencyCode(currencies)) {
    return c.json(
      {
        message: "Invalid parameters!",
      },
      400,
    );
  }

  try {
    const apiClient = getApiClient(c.env.API_KEY);
    const resp = await apiClient.latest({ base_currency: base, currencies });
    return c.json(resp);
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Internal Server Error";
    return c.json({ message }, 500);
  }
});

export default app;
