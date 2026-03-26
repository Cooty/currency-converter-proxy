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
    headers: req.header
  })

  if (level === "error") {
    console.error(logEntry)
  } else if (level === "warning") {
    console.warn(logEntry)
  } else {
    console.log(logEntry)
  }
}
