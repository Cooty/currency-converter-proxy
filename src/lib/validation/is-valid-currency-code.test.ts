import { describe, it, expect } from "@jest/globals"

import { isValidCurrencyCode } from "./is-valid-currency-code.js"

describe("isValidCurrencyCode", () => {
  it("can tell if a currency code is in the list of accepted codes", () => {
    expect(isValidCurrencyCode("EUR")).toBe(true)
    expect(isValidCurrencyCode("USD")).toBe(true)
    expect(isValidCurrencyCode("HUF")).toBe(true)
  })

  it("rejects lowercase codes", () => {
    expect(isValidCurrencyCode("eur")).toBe(false)
  })

  it("rejects codes not in the list", () => {
    expect(isValidCurrencyCode("XXX")).toBe(false)
  })

  it("rejects empty string", () => {
    expect(isValidCurrencyCode("")).toBe(false)
  })
})
