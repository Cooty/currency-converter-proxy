export {};

declare global {
  interface RateLimit {
    limit(input: { key: string }): Promise<{ success: boolean }>;
  }
}
