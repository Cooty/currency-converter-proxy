import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach
} from "@jest/globals"
import type { HonoRequest } from "hono"

import { logException, logRequest } from "./logging.js"

function makeRequest(overrides?: Partial<HonoRequest>): HonoRequest {
  const raw = new Request(
    "https://example.com/latest?base_currency=USD&currencies=EUR",
    {
      method: "GET",
      headers: {
        "user-agent": "jest-test"
      }
    }
  )

  return {
    url: raw.url,
    method: raw.method,
    raw,
    header: ((name?: string) => {
      if (name === undefined) {
        return Object.fromEntries(raw.headers.entries())
      }
      return raw.headers.get(name) ?? undefined
    }) as HonoRequest["header"],
    ...overrides
  } as unknown as HonoRequest
}

describe("logging helpers", () => {
  const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
  const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {})
  const logSpy = jest.spyOn(console, "log").mockImplementation(() => {})

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    errorSpy.mockClear()
    warnSpy.mockClear()
    logSpy.mockClear()
  })

  describe("logException", () => {
    it("logs a structured error for Error instances", () => {
      const req = makeRequest()
      const error = new Error("Something went wrong")

      logException(error, req)

      expect(errorSpy).toHaveBeenCalledTimes(1)
      expect(warnSpy).not.toHaveBeenCalled()
      expect(logSpy).not.toHaveBeenCalled()

      const payload = JSON.parse(errorSpy.mock.calls[0][0] as string) as Record<
        string,
        unknown
      >

      expect(payload).toMatchObject({
        level: "error",
        method: "GET",
        path: "/latest",
        query: "?base_currency=USD&currencies=EUR",
        url: "https://example.com/latest?base_currency=USD&currencies=EUR",
        error: {
          message: "Something went wrong",
          name: "Error"
        }
      })

      expect(payload.error).toHaveProperty("stack")
    })

    it("logs a structured error for non-Error values", () => {
      const req = makeRequest()
      const error = "boom"

      logException(error, req)

      expect(errorSpy).toHaveBeenCalledTimes(1)

      const payload = JSON.parse(errorSpy.mock.calls[0][0] as string) as Record<
        string,
        unknown
      >

      expect(payload).toEqual({
        level: "error",
        method: "GET",
        path: "/latest",
        query: "?base_currency=USD&currencies=EUR",
        url: "https://example.com/latest?base_currency=USD&currencies=EUR",
        error: {
          message: "boom"
        }
      })
    })
  })

  describe("logRequest", () => {
    it("logs with console.error by default", () => {
      const req = makeRequest()

      logRequest("Request failed", req)

      expect(errorSpy).toHaveBeenCalledTimes(1)
      expect(warnSpy).not.toHaveBeenCalled()
      expect(logSpy).not.toHaveBeenCalled()

      const payload = JSON.parse(errorSpy.mock.calls[0][0] as string) as Record<
        string,
        unknown
      >

      expect(payload).toEqual({
        level: "error",
        url: "https://example.com/latest?base_currency=USD&currencies=EUR",
        message: "Request failed",
        headers: {
          clientPlatform: "unknown",
          clientVersion: "unknown",
          connectingIP: "unknown",
          contentType: null,
          userAgent: "jest-test"
        }
      })

      expect(payload).toHaveProperty("headers")
    })

    it("logs with console.warn when level is warning", () => {
      const req = makeRequest()

      logRequest("Something looks off", req, "warning")

      expect(warnSpy).toHaveBeenCalledTimes(1)
      expect(errorSpy).not.toHaveBeenCalled()
      expect(logSpy).not.toHaveBeenCalled()

      const payload = JSON.parse(warnSpy.mock.calls[0][0] as string) as Record<
        string,
        unknown
      >

      expect(payload).toMatchObject({
        level: "warning",
        url: "https://example.com/latest?base_currency=USD&currencies=EUR",
        message: "Something looks off"
      })
    })

    it("logs with console.log when level is info", () => {
      const req = makeRequest()

      logRequest("Request received", req, "info")

      expect(logSpy).toHaveBeenCalledTimes(1)
      expect(errorSpy).not.toHaveBeenCalled()
      expect(warnSpy).not.toHaveBeenCalled()

      const payload = JSON.parse(logSpy.mock.calls[0][0] as string) as Record<
        string,
        unknown
      >

      expect(payload).toMatchObject({
        level: "info",
        url: "https://example.com/latest?base_currency=USD&currencies=EUR",
        message: "Request received"
      })
    })
  })
})
