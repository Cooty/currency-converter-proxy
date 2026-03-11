export interface CurrencyList {
  data: Record<string, Currency>
}

export interface Currency {
  symbol: string
  name: string
  symbol_native: string
  decimal_digits: number
  rounding: number
  code: string
  name_plural: string
}

export interface ExchangeRates {
  data: Record<string, number>
}
