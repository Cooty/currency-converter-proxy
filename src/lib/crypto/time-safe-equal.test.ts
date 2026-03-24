import { describe, it, expect } from "@jest/globals"

import { timingSafeEqual } from "./time-safe-equal.js"

describe("timeSafeEqual: compares string but with equal running time regardless of length", () => {
  it("returns true for two identical strings", () => {
    expect(
      timingSafeEqual(
        "efeecceu3e3e778h3434sddfdf",
        "efeecceu3e3e778h3434sddfdf"
      )
    ).toBe(true)
  })
  it("returns true for two empty strings", () => {
    expect(timingSafeEqual("", "")).toBe(true)
  })
  it("returns false for different strings of different length", () => {
    expect(timingSafeEqual("foo", "efeecceu3e3e778h3434sddfdf")).toBe(false)
  })
  it("returns false for different strings of the same length", () => {
    expect(timingSafeEqual("bar", "baz")).toBe(false)
  })
  it("returns false when only one string is empty", () => {
    expect(timingSafeEqual("", "foo")).toBe(false)
  })
})
