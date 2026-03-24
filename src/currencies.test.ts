import { describe, it, expect, jest, beforeEach } from "@jest/globals"
import app from "./currencies.js"
import { getApiClient } from "./lib/freecurrencyapi/api-client.js"
import type { CurrencyList } from "./lib/freecurrencyapi/types/model/currencies.js"

import fakeCurrencies from "./test/fixtures/currency-list.js"

jest.mock("./lib/freecurrencyapi/api-client.js", () => ({
  getApiClient: jest.fn()
}))

const mockedGetApiClient = jest.mocked(getApiClient)

describe("currency list route handler", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns currencies from the upstream client", async () => {
    const currencies = jest
      .fn<() => Promise<CurrencyList>>()
      .mockResolvedValue(fakeCurrencies)

    mockedGetApiClient.mockReturnValue({
      currencies
    } as any)

    const res = await app.request("https://example.com/", { method: "GET" }, {
      API_KEY: "test-api-key"
    } as Env)

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual(fakeCurrencies)

    expect(mockedGetApiClient).toHaveBeenCalledWith("test-api-key")
    expect(currencies).toHaveBeenCalledTimes(1)
  })

  it("returns 500 with the error message when the upstream throws an Error", async () => {
    const currencies = jest
      .fn<() => Promise<Error>>()
      .mockRejectedValue(new Error("Upstream failed"))

    mockedGetApiClient.mockReturnValue({
      currencies
    } as any)

    const res = await app.request("https://example.com/", { method: "GET" }, {
      API_KEY: "test-api-key"
    } as Env)

    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toEqual({
      message: "Upstream failed"
    })
  })

  it("returns generic 500 message when a non-Error is thrown", async () => {
    const currencies = jest
      .fn<() => Promise<CurrencyList>>()
      .mockImplementation(async () => {
        throw "boom"
      })

    mockedGetApiClient.mockReturnValue({
      currencies
    } as any)

    const res = await app.request("https://example.com/", { method: "GET" }, {
      API_KEY: "test-api-key"
    } as Env)

    expect(res.status).toBe(500)
    await expect(res.json()).resolves.toEqual({
      message: "Internal Server Error"
    })
  })
})
