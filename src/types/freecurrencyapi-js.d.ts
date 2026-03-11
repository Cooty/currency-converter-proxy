declare module "@everapi/freecurrencyapi-js" {
  import type { CurrencyList, ExchangeRates } from "./model/currencies";

  export interface FreecurrencyapiHeaders {
    apikey: string;
  }

  export interface FreecurrencyapiParams {
    [key: string]: string | number | boolean | undefined;
  }

  export interface FreecurrencyapiResponse<T = any> {
    data: T;
    [key: string]: any;
  }

  class Freecurrencyapi {
    baseUrl: string;
    headers: FreecurrencyapiHeaders;

    constructor(apiKey?: string);

    call<T = any>(endpoint: string, params?: FreecurrencyapiParams): Promise<T>;

    status<T = any>(): Promise<T>;

    currencies(params?: FreecurrencyapiParams): Promise<CurrencyList>;

    latest(params?: FreecurrencyapiParams): Promise<ExchangeRates>;

    historical<T = any>(params?: FreecurrencyapiParams): Promise<T>;
  }

  export default Freecurrencyapi;
}
