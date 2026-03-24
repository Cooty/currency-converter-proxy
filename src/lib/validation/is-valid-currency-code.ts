import { currencyCodes } from "./data/currency-codes.js"

export function isValidCurrencyCode(code: string) {
  return currencyCodes.includes(code)
}
