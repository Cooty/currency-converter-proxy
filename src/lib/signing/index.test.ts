import { describe, it, expect } from "@jest/globals"
import {
  normalizeQuery,
  buildCanonicalString,
  signCanonicalString
} from "./index.js"

describe("helper library for checking the request signatures", () => {
  describe("normalizeQuery", () => {
    it("sorts URL query params alphabetically and returns them as a string", () => {
      const testQueryString = "query=Foo&sort=asc&auth=false"
      const queryParams = new URLSearchParams(testQueryString)
      expect(normalizeQuery(queryParams)).toEqual(
        "auth=false&query=Foo&sort=asc"
      )
    })
  })

  describe("buildCanonicalString", () => {
    it("builds a canonical string from parts of the request", () => {
      const getExample = buildCanonicalString({
        method: "GET",
        path: "/api/stuff",
        query: "auth=false&query=Foo&sort=asc",
        timestamp: "1774266050"
      })
      expect(getExample).toEqual(
        "GET\n/api/stuff\nauth=false&query=Foo&sort=asc\n1774266050\n"
      )
      const postExample = buildCanonicalString({
        method: "POST",
        path: "/api/stuff/add",
        query: "auth=false",
        timestamp: "1774266050",
        bodyHash: "3edvfgghgdfdfdfdf"
      })
      expect(postExample).toEqual(
        "POST\n/api/stuff/add\nauth=false\n1774266050\n3edvfgghgdfdfdfdf"
      )
    })
  })

  describe("signCanonicalString", () => {
    it("produces the same output given the same input", async () => {
      const canonical =
        "GET\n/api/stuff\nauth=false&query=Foo&sort=asc\n1774266050\n"
      const secret1 =
        "adeff991fdaa79975162556ed5afceaee34ee0bcb64408b4298d2801c8a4e971"
      const secret2 =
        "494f4de636cc1055404c7137c399d368499cbd873d7e04ea06fcce3cc34d4e33"
      const firstRun = await signCanonicalString(secret1, canonical)
      const secondRun = await signCanonicalString(secret2, canonical)
      expect(firstRun).not.toBe(secondRun)
    })

    it("produces different output given a different canonical strings", async () => {
      const canonical1 =
        "GET\n/api/stuff\nauth=false&query=Foo&sort=asc\n1774266050\n"
      const canonical2 =
        "POST\n/api/stuff\nauth=true&query=Foo&sort=asc\n1774266050\n"
      const secret =
        "adeff991fdaa79975162556ed5afceaee34ee0bcb64408b4298d2801c8a4e971"
      const firstRun = await signCanonicalString(secret, canonical1)
      const secondRun = await signCanonicalString(secret, canonical2)

      expect(firstRun).not.toBe(secondRun)
    })

    it("produces different output if newline characters are different in the canonical string", async () => {
      const canonical1 =
        "GET\n/api/stuff\nauth=false&query=Foo&sort=asc\n1774266050\n"
      const canonical2 =
        "GET\n/api/stuff\nauth=false&query=Foo&sort=asc\n1774266050"
      const secret =
        "adeff991fdaa79975162556ed5afceaee34ee0bcb64408b4298d2801c8a4e971"
      const firstRun = await signCanonicalString(secret, canonical1)
      const secondRun = await signCanonicalString(secret, canonical2)

      expect(firstRun).not.toBe(secondRun)
    })

    it("returns base64 encoded signature", async () => {
      const canonical =
        "GET\n/api/stuff\nauth=false&query=Foo&sort=asc\n1774266050\n"
      const secret =
        "adeff991fdaa79975162556ed5afceaee34ee0bcb64408b4298d2801c8a4e971"
      const result = await signCanonicalString(secret, canonical)
      expect(result).toMatch(/^[A-Za-z0-9+/]+={0,2}$/)
    })
  })
})
