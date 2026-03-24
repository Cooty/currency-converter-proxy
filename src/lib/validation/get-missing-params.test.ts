import { describe, it, expect } from "@jest/globals"

import { getMissingParams } from "./get-missing-params.js"

describe("getMissingParams: lists missing parameters based on an object of required parameters", () => {
  it("returns empty array if there are no missing params", () => {
    const missingParams = getMissingParams({
      base_currency: "foo",
      currencies: "bar"
    })
    expect(missingParams.length).toBe(0)
  })
  it("returns the array of params that are missing from the params who's value is undefined", () => {
    const missingParams = getMissingParams({
      base_currency: undefined,
      currencies: "bar"
    })
    expect(missingParams.length).toBe(1)
    expect(missingParams[0]).toBe("base_currency")
  })

  it("it also counts the param as empty if the value is an empty string", () => {
    const missingParams = getMissingParams({
      base_currency: "",
      currencies: ""
    })
    expect(missingParams.length).toBe(2)
    expect(missingParams[0]).toBe("base_currency")
    expect(missingParams[1]).toBe("currencies")
  })
})
