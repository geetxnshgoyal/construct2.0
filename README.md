# CoNSTruct — Registration Site & Express Backend

This repository bundles a public-facing hackathon site with a hardened Node/Express API that stores team registrations in Firebase Firestore using the Admin SDK.

## Project layout

- `public/` — static assets served by Express (HTML, CSS, JS, images, PWA manifests, service worker).
- `server/` — Express app, Firebase Admin bootstrap, and Firestore service logic.
- `api/submit.js` — Vercel-compatible serverless handler that reuses the same validation/service layer.
- `Procfile` — process declaration for hosts such as Heroku/Railway.

```
.
├── public/
│   ├── assets/
│   ├── css/
│   ├── index.html
│   ├── registration.html
│   └── ...
├── server/
│   ├── index.js
│   ├── firebaseAdmin.js
│   └── services/teamRegistrations.js
├── api/submit.js
└── package.json
```

## Requirements

- Node.js 18+
- A Firebase project with Cloud Firestore enabled.
- A Firebase service account JSON key with Firestore read/write permissions.

## Environment variables

| Variable | Description |
| --- | --- |
| `FIREBASE_SERVICE_ACCOUNT` | Optional. Inline the full JSON of the Firebase service account, or a base64-encoded version. |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Optional. Path to a service-account JSON file. Defaults to `construct-nst-firebase-adminsdk-fbsvc-ddd816136c.json` bundled in the repo. |
| `PORT` | Optional. HTTP port for the Express server (defaults to `3001`). |
| `CORS_ORIGIN` | Optional. Comma-separated list of origins allowed to hit the API. Defaults to `*`. |
| `API_RATE_LIMIT_MAX` | Optional. Requests per minute for the `/api` rate limiter (defaults to `60`). |
| `ADMIN_USERNAME` | Admin portal username (defaults to `admin`). |
| `ADMIN_PASSWORD` | Admin portal password used for Basic Auth. |

## Local development

Create a `.env` file (see `.env.example`) and either paste the Firebase service account JSON into `FIREBASE_SERVICE_ACCOUNT` or point `FIREBASE_SERVICE_ACCOUNT_PATH` to a secure location outside the repository. The actual JSON file should never be committed to source control.

Install dependencies:

```bash
npm install
```

Start the Express server:

```bash
npm start
```

Visit `http://localhost:3001/` for the landing page and `http://localhost:3001/registration.html` for the form.

For automated reloads while editing server files:

```bash
npm run dev
```

## How submissions work

1. The registration form posts to `POST /api/registrations` (also aliased as `POST /api/submit`).
2. `server/routes/registrations.js` validates payloads with shared logic from `server/services/teamRegistrations.js`.
3. Valid submissions are written to the `teamRegistrations` collection in Firestore with an Admin-generated timestamp.
4. Validation enforces:
   - Required core fields (team name).
   - Team lead details (name, college email, gender).
   - Team member roster (at least two members with name, college email, gender; up to four recorded).
   - Email formatting for all required emails.

If validation fails, the API returns a `400` with a human-readable error. Other failures bubble up to a `500`.

## Admin dashboard

- Visit `http://localhost:3001/admin` (or `/admin.html`) to review registrations. A Basic Auth prompt will appear; use the credentials from `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
- Once authenticated, the page calls `GET /api/registrations` and renders the most recent submissions (default limit 100).
- Unauthenticated requests receive `401` responses. Ensure the password stays secret (store it in your deployment environment, not in the repo).

## Deploying

### Express apps (Heroku, Render, Railway, Fly.io, VPS)

1. Push the repository to your host.
2. Configure the `FIREBASE_SERVICE_ACCOUNT` environment variable.
3. Use the included `Procfile` or set the start command to `npm start`.

The Express app serves everything from `public/` and exposes the API under `/api`.

### Vercel / serverless

- Deploy the static site (`public/` becomes the output directory).
- The file `api/submit.js` is already compatible with Vercel’s serverless runtime.
- Remember to set the `FIREBASE_SERVICE_ACCOUNT` environment variable in the Vercel dashboard.

## Static asset customization

- Update `public/assets/js/firebase-config.js` with your Firebase web app config if you want optional client-side reads.
- Update PWA metadata (`public/manifest.json`, `public/service-worker.js`) with your own icons and cache strategy.
- Replace placeholder domains inside `public/robots.txt` and `public/sitemap.xml` before going live.

## Testing checklist

- [ ] `npm start` bootstraps Express and serves `public/`.
- [ ] Submitting the registration form returns `201` and persists to Firestore.
- [ ] Invalid submissions receive descriptive `400` errors.
- [ ] Analytics beacons hit `/api/_analytics` (stubbed logging).
- [ ] Service worker installs and caches the declared assets.

## Troubleshooting

- **`Server misconfiguration` / `Failed to save submission`** — ensure `FIREBASE_SERVICE_ACCOUNT` is present and well-formed JSON (or decodeable from base64).
- **CORS errors** — set `CORS_ORIGIN` to an allowed origin list (e.g., `https://yourdomain.com`).
- **Rate limit triggered** — raise `API_RATE_LIMIT_MAX` for trusted environments.

Feel free to tailor the copy, styling, and validation rules to match your event requirements.
