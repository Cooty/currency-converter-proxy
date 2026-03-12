import Freecurrencyapi from "@everapi/freecurrencyapi-js";

let apiClient: Freecurrencyapi | null = null;
let cachedApiKey: string | null = null;

export const getApiClient = (apiKey: string) => {
  if (apiClient && cachedApiKey === apiKey) {
    return apiClient;
  }

  apiClient = new Freecurrencyapi(apiKey);
  cachedApiKey = apiKey;
  return apiClient;
};
