import type { HonoRequest } from "hono"

function serializeError(e: unknown) {
  if (e instanceof Error) {
    return {
      message: e.message,
      stack: e.stack,
      name: e.name
    }
  }

  return {
    message: String(e)
  }
}

function getHeaders(req: HonoRequest) {
  const headers = req.raw.headers

  return {
    contentType: headers.get("content-type"),
    userAgent: req.header("user-agent") ?? "unknown",
    connectingIP: req.header("cf-connecting-ip") ?? "unknown",
    clientVersion: req.header("x-client-version") ?? "unknown",
    clientPlatform: req.header("x-client-platform") ?? "unknown"
  }
}

export function logException(e: unknown, req: HonoRequest) {
  const url = new URL(req.url)

  console.error(
    JSON.stringify({
      level: "error",
      method: req.method,
      path: url.pathname,
      query: url.search,
      url: req.url,
      error: serializeError(e)
    })
  )
}

export function logRequest(
  message: string,
  req: HonoRequest,
  level: "error" | "warning" | "info" = "error"
) {
  const logEntry = JSON.stringify({
    level,
    url: req.url,
    message,
    headers: getHeaders(req)
  })

  if (level === "error") {
    console.error(logEntry)
  } else if (level === "warning") {
    console.warn(logEntry)
  } else {
    console.log(logEntry)
  }
}
