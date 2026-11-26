# PlaySpot PK Web Frontend

Responsive React web app for the PlaySpot PK player and venue-provider experiences. This project is separate from the React Native frontend and Node.js backend.

## Requirements

- Node.js 22.11 or newer
- npm

## Install and run

```sh
npm install
npm run start
```

Open `http://localhost:5173`. The development server supports client-side route fallback.

## Production build

```sh
npm run build
```

Webpack writes the production bundle to `dist/`.

## Foundation and ownership

- `src/main.jsx` mounts React and the browser router.
- `src/App.jsx` owns the public landing page and top-level routes.
- `src/auth/` owns session state and protected-route checks.
- `src/services/apiClient.js` owns API requests, response parsing and refresh-token rotation.
- `src/pages/AuthPages.jsx` owns login, registration and password-recovery information.
- `src/pages/WorkspacePages.jsx` owns player/vendor route shells and profile settings.
- `src/components/WorkspaceFrame.jsx` owns the role-specific navigation shell.
- `src/components/ui.jsx` contains shared container, card, button and field primitives.
- `src/styles.css` and `src/account.css` define design tokens, responsive layouts and focus states.
- `webpack.config.js` configures the development server and production build.

The landing page and account screens follow the exported PNG references in `PlaySpot PK - Web App Design/`.

## Authentication and backend

Start the backend separately from `FYP_PlaySpot_Node_JS_BE` with `npm run dev`, then start this project with `npm run start`. The web development server proxies `/api` to `http://127.0.0.1:4000` and removes the browser `Origin` header on this local proxy request. It does not change backend CORS settings. The backend must have its database setup completed for registration and profile operations to work.

For a built deployment, set `PLAYSPOT_API_BASE_URL` to the API base URL, including `/api/v1`, before running `npm run build`. The deployed backend must allow the deployed browser origin through its `APP_ORIGINS` setting.

The API client follows the backend `{ success, data }` and `{ success: false, error }` response envelope. Access tokens stay in memory; the rotating refresh token is held in tab-scoped `sessionStorage` so a reload in the same tab can restore the session. Closing the tab ends local restoration. The backend does not provide HttpOnly-cookie sessions, so the refresh token remains accessible to page JavaScript. Passwords are sent to the backend only during login/registration and are not stored by the web app.

Player registration reads the active sport catalog from `GET /api/v1/sports`. Vendor registration creates only the account and vendor profile; venue/court setup is a later flow. Vendor accounts remain pending verification until approved. Forgot-password explains the current backend limitation and does not claim to send an email or OTP.

## Stage 2 routes

- Public: `/login`, `/register`, `/register/player`, `/register/vendor`, `/forgot-password`.
- Protected player: `/player/*`.
- Protected vendor: `/vendor/*`.
- Protected account settings: `/profile`.

Role checks guide browser navigation only; the backend remains authoritative for authorization.
