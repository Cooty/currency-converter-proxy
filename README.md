# ▶️ Proxy server for Free Currency API

This is a small proxy-server for [freecurrencyapi.com](https://freecurrencyapi.com/).

It's implemented as a [Cloudflare Worker](https://workers.cloudflare.com/), and it's built with [Hono](https://hono.dev) framework.

Intended to be used as the production proxy for [Cooty/currency-converter](https://github.com/Cooty/currency-converter)

## 👷‍♀️ Local development

Local development uses [Wrangler](https://www.npmjs.com/package/wrangler).

```
npm install
npm run dev
```

## 🏗️ Deployment

Deployment is manual, it can be done via calling the `npm deploy` script, which calls wrangler's `deploy` command, you'll need to login with your Cloudflare account.
