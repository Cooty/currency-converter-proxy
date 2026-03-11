import Freecurrencyapi from "@everapi/freecurrencyapi-js";

export const apiClient = new Freecurrencyapi(process.env.API_KEY);
