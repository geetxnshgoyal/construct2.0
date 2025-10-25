# CoNSTruct 2025 — Cosmic React Edition

The CoNSTruct hackathon experience now runs on a React + Vite front-end with an Express/Firebase API. Expect a neon-charged landing experience, a reactive registration flow, and an admin console that mirrors Firestore submissions in realtime.

## Architecture

```
.
├── client/                 # Vite + React + Tailwind front-end
│   ├── index.html
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── data/
│   └── public/             # Static assets consumed by Vite
├── server/                 # Express API + Firebase Admin bootstrap
│   ├── index.js
│   ├── routes/
│   ├── services/
│   └── middleware/
├── api/submit.js           # Serverless handler that reuses server/services
├── data/local-registrations.json
└── package.json            # Root scripts for API + client orchestration
```

- The React app lives in `client/` (Vite, React 18, Tailwind, Framer Motion, React Router).
- When `client/dist` exists (after `npm run client:build`), Express serves it as the SPA shell. Otherwise it falls back to the legacy `public/` folder.
- `/api/registrations` and `/api/submit` are identical POST endpoints accepting team payloads.
- `/api/registrations` (GET) stays Basic Auth–protected for admins.

## Prerequisites

- Node.js 18+
- npm 9+
- Firebase project with Cloud Firestore
- Service account JSON with read/write access (see `.env.example`)

## Environment variables

| Variable | Description |
| --- | --- |
| `FIREBASE_SERVICE_ACCOUNT` | Optional. Inline JSON (or base64) for the service account. |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Optional. Path to service-account JSON (defaults to bundled sample). |
| `PORT` | Express port (default `3001`). |
| `CORS_ORIGIN` | Comma-separated list of allowed origins. |
| `API_RATE_LIMIT_MAX` | Requests per minute for the `/api` limiter (default `60`). |
| `ADMIN_USERNAME` | Basic Auth username for the admin console (default `admin`). |
| `ADMIN_PASSWORD` | Basic Auth password (required in production). |

## Install & run

Install dependencies once for the server:

```bash
npm install
```

### Run the React client

In one terminal:

```bash
npm run client:dev
```

- Vite boots at `http://localhost:5173` with Hot Module Reload.
- Proxies are not configured; API calls still point to `http://localhost:3001`.

### Run the Express API

In another terminal:

```bash
npm run dev
# or
npm start
```

The API listens on `http://localhost:3001`. When you build the React client (`npm run client:build`), the Express server will start serving `client/dist` automatically.

### Production build

```bash
npm run client:build
npm start
```

`client/dist` becomes the SPA entry point, served by Express alongside the `/api` routes. Use `npm run client:preview` for a static preview powered by Vite.

## Front-end features

- Animated hero with countdown timer, neon backdrop, and orbiting particles.
- Dark/light theme toggle with persisted preference.
- Section navigation powered by React Router + smooth hash scrolling.
- Tailwind-powered cards for timeline, guidelines, awards, and partners.
- Registration form with dynamic member slots, validation helpers, and live API submission.
- Admin console that authenticates with Basic Auth and renders curated registration cards.
- Analytics beacons emit `page_view` events to `/api/_analytics` using `navigator.sendBeacon`.

## API workflow

1. Registration form posts JSON to `POST /api/registrations`.
2. Payload validated via `server/services/teamRegistrations.js`.
3. Valid submissions persist to Firestore (or `data/local-registrations.json` fallback when Firestore is absent).
4. Admin console hits `GET /api/registrations` with Basic Auth headers.

## Troubleshooting

| Issue | Fix |
| --- | --- |
| `Admin access is not configured` | Supply `ADMIN_PASSWORD` in `.env` or your hosting platform. |
| `Failed to save submission` | Confirm Firebase credentials and Firestore permissions. |
| CORS errors | Set `CORS_ORIGIN` to the front-end origin list. |
| Express serves old static HTML | Run `npm run client:build` so `client/dist/index.html` exists. |

## Deployment notes

- **Full-stack hosts (Render, Railway, Fly.io, VPS)**: build the client during deploy (`npm run client:build`) and launch with `npm start`.
- **Static hosting + serverless**: deploy `client/dist` to your static host of choice and reuse `api/submit.js` as a serverless endpoint.
- **Vercel hybrid**: deploy `client/` as the front-end, mount `api/submit.js`, and keep the Express server for environments where SSR is unnecessary.

Bring your own brand edits, motion tweaks, and data sources — the React structure is modular, so you can slot in live leaderboards, mentor rosters, or hackathon telemetry next.
