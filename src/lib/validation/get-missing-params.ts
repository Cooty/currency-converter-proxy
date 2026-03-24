export function getMissingParams(
  requiredParams: Record<string, string | undefined>
) {
  return Object.entries(requiredParams)
    .filter(([, value]) => value === undefined || value === "")
    .map(([key]) => key)
}
