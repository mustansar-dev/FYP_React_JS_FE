# PlaySpot PK — React.js Frontend Codex Prompts

Use these prompts in order, one prompt per Codex session. The week plan is in `PLAYSPOT_FRONTEND_WEEK_PLAN.md`. Each prompt is independently usable: inspect the current working tree and backend contract before implementation; do not assume prior sessions completed work unless it is present in the repository.

**Design reference:** [PlaySpot PK — Web App Design in Figma](https://www.figma.com/design/DlUWCFqxHUOrwI8Q0wnh2f/PlaySpot-PK-%E2%80%94-Web-App-Design?node-id=0-1&t=5eZkLKsPnZB8djuA-1)

## GLOBAL RULES — apply to every prompt

1. Work on the React.js web frontend only. The current workspace includes `FYP_PlaySpot_React_Native_FE` and `FYP_PlaySpot_Node_JS_BE`; do not convert, replace or make web code depend on React Native screens, navigation, AsyncStorage or native-only components. First locate the web app if it exists; if not, follow Prompt 1's foundation task and preserve both existing projects.
2. Read the week plan, the web project's package manifest and existing source, plus `FYP_PlaySpot_Node_JS_BE/README.md` and the relevant backend router/schema/service before using an endpoint. Backend source and README define actual routes, DTOs, permissions, response envelopes and limitations. Never invent API routes or claim unsupported capabilities.
3. Preserve existing user changes and architecture. Inspect status/diff before edits, keep changes scoped to the prompt, reuse established components and dependencies, and avoid unrelated refactors or large new libraries.
4. Use the supplied Figma design when accessible. Match its page structure and visual language while maintaining responsive browser layouts and accessible controls. If Figma access is unavailable, state that limitation and follow existing local design assets/tokens without pretending to have inspected the file.
5. Keep player and vendor experiences distinct and protect role-restricted pages in the UI; the backend remains authoritative for authorization, prices, availability and payment state.
6. Handle loading, empty, validation, network, authorization and success states. Do not hide API failures by silently substituting fixtures or showing fake successful mutations. Never put secrets in source or logs.
7. Use the existing package manager and scripts. Run relevant checks that exist after changes; report exact commands/results and any environment blockers. Do not claim an unrun check passed. Before finishing, inspect the diff and summarize files changed, API calls used and remaining limitations.

---

## Prompt 1 — Stage 1: Audit, React.js foundation and design system

**Objective:** Establish the actual web frontend foundation and shared visual shell without changing the separate React Native or backend projects.

```text
You are implementing Stage 1 of the PlaySpot PK React.js web frontend. Read PLAYSPOT_FRONTEND_WEEK_PLAN.md and these global instructions first.

Audit the workspace and locate any React.js web frontend, requirements, design assets and existing changes. The known projects are FYP_PlaySpot_React_Native_FE and FYP_PlaySpot_Node_JS_BE; do not treat the React Native app as the web frontend. Inspect root and project package manifests, scripts, route setup and styles. Review the linked Figma design if available. If no web app exists, create the smallest maintainable React.js web foundation in an appropriate separate location, using compatible existing tooling where possible; do not disturb mobile/backend projects or introduce a complex architecture.

Implement the web entry point, responsive app shell, public welcome/landing route, not-found route, route handling and a modest shared design foundation (tokens plus reusable buttons, fields, cards/container as needed). Use semantic HTML and keyboard-accessible navigation. Keep the visual treatment aligned with Figma. Confirm actual start/build commands from package scripts.

Do not integrate APIs or build later-stage feature screens yet. Verify startup and existing relevant checks. Report the web project path, architecture and commands, Figma access status, changed files, checks run and any setup assumptions.
```

## Prompt 2 — Stage 2: Authentication and role-based web experience

**Objective:** Implement player/vendor auth flows and protected role-specific route shells using the existing auth contract.

```text
Implement Stage 2 of the PlaySpot PK React.js web frontend. Read the week plan, global rules, current web app, backend README, auth router/schemas and relevant user/vendor profile code.

Build login, player registration, vendor registration, session restoration/refresh, logout, profile/settings and role-aware route protection. Use only implemented endpoints and their exact request/response shapes, including POST /api/v1/auth/register/player, /auth/register/vendor, /auth/login, /auth/refresh, /auth/logout, GET /auth/me, GET/PATCH /users/me and GET/PATCH /vendors/me as verified in current source. Preserve the API's success/error envelope and role strings. Add a small web API client/session boundary consistent with existing architecture. Choose browser-safe token handling appropriate to the existing app; do not use AsyncStorage or store passwords. Never assume the client role grants authorization.

Provide validation and clear server errors. Keep forgot-password truthful: the inspected backend currently documents that it does not send email or OTP; do not fake password reset. Create player and vendor route shells that later stages can extend.

Run existing relevant checks and manually verify both role journeys if the API environment is available. Report exact endpoints and session approach, checks/results, and any credential/backend limitation.
```

## Prompt 3 — Stage 3: Player discovery and venue details

**Objective:** Connect player venue search and details to the existing discovery/catalog APIs.

```text
Implement Stage 3 of the PlaySpot PK React.js web frontend. Inspect the current web app and backend README plus venue router, schemas and DTO-producing code before editing.

Build the player home/discovery and search experience, venue cards, search/filter/sort controls, venue detail route, and responsive location/map view only to the extent supported by existing web dependencies and backend data. Use verified routes such as GET /api/v1/venues, /venues/nearby, /venues/:venueId, /venues/:venueId/courts, /venues/:venueId/equipment, /amenities and /sports. Confirm exact filters, query names and response shapes in source; do not guess. Use published venue data and show facilities, courts, available media and equipment from responses.

Do not claim GPS, geocoding or a live map when unavailable. Provide a useful manual location/search fallback and accurately label any schematic/map limitation. Include loading, empty, error, retry and filter-reset states. Do not use fixture fallback to mask failed requests.

Verify search/filter/detail behavior with existing tests or a configured API. Report exact APIs, checks/results, design/Figma fit and unsupported map behavior.
```

## Prompt 4 — Stage 4: Reviews and court booking

**Objective:** Implement the player path from venue inspection through review and a server-confirmed court booking.

```text
Implement Stage 4 of the PlaySpot PK React.js web frontend. Read the current UI and backend review/booking routers, validation schemas and services; verify exact data names before coding.

Add review listing/submission and the booking flow: choose a court, request date availability, select an available slot, choose supported equipment/add-ons and quantities, review the booking summary, and create the booking. Use verified routes including GET /api/v1/venues/:venueId/reviews, POST/PATCH review routes, GET /api/v1/courts/:courtId/availability?date=..., and POST /api/v1/bookings. The backend requires a completed booking for review eligibility, uses `courtId` in API paths, and calculates booking prices server-side; follow exact current request DTOs rather than trusting client totals. Handle slot conflicts, validation, ineligible reviews and network failures.

Keep pages responsive and reuse the shared design system. Do not add payment behavior beyond the booking API's actual response; that is Stage 5. Verify the happy path and important error states using available checks/API. Report endpoints, results and remaining constraints.
```

## Prompt 5 — Stage 5: Player bookings and payments

**Objective:** Let players manage their bookings and interact with only the payment methods actually implemented by the backend.

```text
Implement Stage 5 of the PlaySpot PK React.js web frontend. Inspect current booking/payment components, backend README and payment/booking routers, schemas and services.

Build My Bookings, booking detail and eligible cancellation using verified endpoints such as GET /api/v1/bookings/me, GET /bookings/:bookingId and POST /bookings/:bookingId/cancel. Connect payment actions/status to the exact implemented routes: inspect contribution creation, checkout, payment status, receipt submission and supported methods before choosing calls. Safepay is sandbox-only in this academic setup; pay-at-venue remains unpaid until an authorized vendor records collection; bank transfer proof requires vendor review. Never mark paid from a browser redirect, receipt upload or client-provided value. Show pending, failed, due, review and confirmed states based on server responses.

Keep unsupported/refund behavior explicit and avoid fake success. Test booking history, cancellation rules and each available payment path with existing tests or a configured backend. Report the verified endpoints/payment states, exact checks/results, and whether live provider credentials are unavailable.
```

## Prompt 6 — Stage 6: Rooms, chat, tournaments and leaderboards

**Objective:** Complete the player community and competition experience using persisted backend state.

```text
Implement Stage 6 of the PlaySpot PK React.js web frontend. Inspect the current app and backend community, payment and notification routes/services plus Socket.IO auth contract before making changes.

Build game-room browse/detail/create/join/leave flows, private invite handling, chat inbox/conversation, tournament list/detail/team registration and tournament/global leaderboards. Use exact implemented endpoints confirmed in source, including /api/v1/game-rooms, /game-rooms/me, room join/invite routes, /conversations and message routes, /tournaments, team registration routes, tournament leaderboard and /leaderboards. Respect server capacity, membership and role rules. Use REST for persisted history and mutations. Add authenticated Socket.IO realtime only if the existing web stack can support it cleanly; keep REST history/send usable and clearly handle disconnects.

Do not invent split payment, push notification or live behavior not present in the backend. Test role access, room capacity/private invite handling, message send/history and tournament registration/leaderboards where environment permits. Report exact routes and checks/results.
```

## Prompt 7 — Stage 7: Vendor workspace and venue operations

**Objective:** Give vendors a usable web workspace for venue operations, bookings and analytics.

```text
Implement Stage 7 of the PlaySpot PK React.js web frontend. Inspect the backend README and venue, booking, analytics, notification and media routers/schemas before editing; inspect the existing web app and reuse its components.

Build vendor dashboard/profile, venue list/editor, courts, facilities/amenities, equipment inventory, media management, availability, booking management, walk-in booking, reviews and analytics. Use only verified vendor endpoints such as /api/v1/vendors/me, /vendors/me/venues, venue/court/equipment CRUD, media signed-upload/confirm, /vendors/me/bookings, /vendors/me/bookings/walk-in, court availability, vendor analytics and relevant review routes. Preserve draft/published and ownership behavior. Implement media upload only through the backend's signed upload and confirm contract; never represent a local file path as uploaded media. Walk-in bookings must use the shared availability and server rules. Render analytics from API response fields, not hardcoded sample metrics.

Protect vendor routes in the UI while relying on server authorization. Include form validation, loading/errors, empty states and confirmation for destructive actions. Verify an edit, booking/walk-in and analytics load using available tests/API. Report exact endpoints, checks/results and media/backend limitations.
```

## Prompt 8 — Stage 8: Cross-role integration and release verification

**Objective:** Verify the full web experience, correct integration defects and prepare a clear handoff.

```text
Implement Stage 8 of the PlaySpot PK React.js web frontend. Audit the current web diff, project scripts, backend README/API implementation and the player/vendor flows from the previous stages. Preserve unrelated changes.

Check responsive layouts, shared navigation, keyboard and accessibility basics, API error/session handling, route protection, loading/empty states and links between player and vendor pages. Fix scoped integration defects and dead primary actions. Run the project's actual lint, test, typecheck and production build scripts when present; do not invent scripts or claim unrun checks passed. Exercise the critical paths where a backend is available: player login → discovery → details → availability/booking → booking/payment state; vendor login → venue/court management → availability/walk-in → bookings/analytics. Verify no client-only action claims durable server success.

Update the existing web project documentation with real setup/run/check commands and concise implemented feature/limitation notes, without creating oversized specifications. Explicitly list unavailable external credentials/services or backend limitations (including live payment, maps/geocoding, forgot-password and push notifications when applicable). Finish with changed files, commands/results, known issues and the next concrete handoff step.
```

---

## Session completion checklist

- [ ] Confirmed this prompt's scope against the current working tree before editing.
- [ ] Used the backend's actual current routes, DTOs and authorization behavior.
- [ ] Preserved the separate React Native app and unrelated work.
- [ ] Followed the supplied Figma design where accessible and kept the UI responsive.
- [ ] Ran relevant existing checks and reported results accurately.
- [ ] Recorded remaining limitations and left the app in a runnable state.
