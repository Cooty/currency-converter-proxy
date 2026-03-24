import { describe, it, expect, jest, beforeEach } from "@jest/globals"

import app from "./latest.js"
import fakeExchangeRates from "./test/fixtures/latest-exchange-rate.js"
import { getApiClient } from "./lib/freecurrencyapi/api-client.js"
import type { ExchangeRates } from "./lib/freecurrencyapi/types/model/currencies.js"

jest.mock("./lib/freecurrencyapi/api-client.js", () => ({
  getApiClient: jest.fn()
}))

const mockedApiClient = jest.mocked(getApiClient)

describe("latest exchange rate handler", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns 400 if both params are missing", async () => {
    const res = await app.request("https://example.com/", { method: "GET" }, {
      API_KEY: "test-api-key"
    } as Env)
    expect(res.status).toBe(400)
    expect(mockedApiClient).not.toHaveBeenCalled()
    await expect(res.json()).resolves.toEqual({
      message:
        "The following required parameters are missing: base_currency, currencies"
    })
  })

  it("returns 400 if one param is missing", async () => {
    const res1 = await app.request(
      "https://example.com/?base_currency",
      { method: "GET" },
      {
        API_KEY: "test-api-key"
      } as Env
    )
    expect(res1.status).toBe(400)
    expect(mockedApiClient).not.toHaveBeenCalled()
    await expect(res1.json()).resolves.toEqual({
      message:
        "The following required parameters are missing: base_currency, currencies"
    })

    const res2 = await app.request(
      "https://example.com/?currencies",
      { method: "GET" },
      {
        API_KEY: "test-api-key"
      } as Env
    )
    expect(res2.status).toBe(400)
    expect(mockedApiClient).not.toHaveBeenCalled()
    await expect(res2.json()).resolves.toEqual({
      message:
        "The following required parameters are missing: base_currency, currencies"
    })
  })

  it("returns 400 if one or more parameters are empty", async () => {
    const res1 = await app.request(
      "https://example.com/?base_currency&currencies",
      { method: "GET" },
      {
        API_KEY: "test-api-key"
      } as Env
    )
    expect(res1.status).toBe(400)
    expect(mockedApiClient).not.toHaveBeenCalled()
    await expect(res1.json()).resolves.toEqual({
      message: "Invalid parameters!"
    })

    const res2 = await app.request(
      "https://example.com/?base_currency=EUR&currencies",
      { method: "GET" },
      {
        API_KEY: "test-api-key"
      } as Env
    )
    expect(res2.status).toBe(400)
    expect(mockedApiClient).not.toHaveBeenCalled()
    await expect(res2.json()).resolves.toEqual({
      message: "Invalid parameters!"
    })

    const res3 = await app.request(
      "https://example.com/?base_currency&currencies=EUR",
      { method: "GET" },
      {
        API_KEY: "test-api-key"
      } as Env
    )
    expect(res3.status).toBe(400)
    expect(mockedApiClient).not.toHaveBeenCalled()
    await expect(res3.json()).resolves.toEqual({
      message: "Invalid parameters!"
    })
  })

  it("returns 400 if one or the other parameters have an invalid value", async () => {
    const res1 = await app.request(
      "https://example.com/?base_currency=foo&currencies=bar",
      { method: "GET" },
      {
        API_KEY: "test-api-key"
      } as Env
    )
    expect(res1.status).toBe(400)
    expect(mockedApiClient).not.toHaveBeenCalled()
    await expect(res1.json()).resolves.toEqual({
      message: "Invalid parameters!"
    })

    const res2 = await app.request(
      "https://example.com/?base_currency=EUR&currencies=bar",
      { method: "GET" },
      {
        API_KEY: "test-api-key"
      } as Env
    )
    expect(res2.status).toBe(400)
    expect(mockedApiClient).not.toHaveBeenCalled()
    await expect(res2.json()).resolves.toEqual({
      message: "Invalid parameters!"
    })
  })

  it("returns 400 with singular grammar if exactly one param is missing", async () => {
    const res = await app.request(
      "https://example.com/?base_currency=USD",
      { method: "GET" },
      { API_KEY: "test-api-key" } as Env
    )

    expect(res.status).toBe(400)
    expect(mockedApiClient).not.toHaveBeenCalled()
    await expect(res.json()).resolves.toEqual({
      message: "The following required parameter is missing: currencies"
    })
  })

  it("returns 400 with singular grammar when base_currency is missing", async () => {
    const res = await app.request(
      "https://example.com/?currencies=EUR",
      { method: "GET" },
      { API_KEY: "test-api-key" } as Env
    )

    expect(res.status).toBe(400)
    expect(mockedApiClient).not.toHaveBeenCalled()
    await expect(res.json()).resolves.toEqual({
      message: "The following required parameter is missing: base_currency"
    })
  })

  it("returns an exchange rate when parameters are valid", async () => {
    const latest = jest
      .fn<() => Promise<ExchangeRates>>()
      .mockResolvedValue(fakeExchangeRates)

    mockedApiClient.mockReturnValue({
      latest
    } as any)

    const resp = await app.request(
      "https://example.com/?base_currency=USD&currencies=EUR",
      { method: "GET" },
      {
        API_KEY: "test-api-key"
      } as Env
    )
    expect(resp.status).toBe(200)
    expect(mockedApiClient).toHaveBeenCalledWith("test-api-key")
    await expect(resp.json()).resolves.toHaveProperty("data")
  })

  it("returns the error message from the upstream API if there is one", async () => {
    const latest = jest
      .fn<() => Promise<Error>>()
      .mockRejectedValue(new Error("API error"))

    mockedApiClient.mockReturnValue({
      latest
    } as any)

    const resp = await app.request(
      "https://example.com/?base_currency=USD&currencies=EUR",
      { method: "GET" },
      {
        API_KEY: "test-api-key"
      } as Env
    )
    expect(resp.status).toBe(500)
    expect(mockedApiClient).toHaveBeenCalledWith("test-api-key")
    await expect(resp.json()).resolves.toEqual({ message: "API error" })
  })

  it("returns generic 500 error when something goes wrong", async () => {
    const latest = jest
      .fn<() => Promise<ExchangeRates>>()
      .mockRejectedValue("ohh nooo!")

    mockedApiClient.mockReturnValue({
      latest
    } as any)

    const resp = await app.request(
      "https://example.com/?base_currency=USD&currencies=EUR",
      { method: "GET" },
      {
        API_KEY: "test-api-key"
      } as Env
    )
    expect(resp.status).toBe(500)
    expect(mockedApiClient).toHaveBeenCalledWith("test-api-key")
    await expect(resp.json()).resolves.toEqual({
      message: "Internal Server Error"
    })
  })
})
