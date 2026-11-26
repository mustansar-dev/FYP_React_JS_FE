# PlaySpot PK — React.js Web Frontend Week Plan
**Project:** PlaySpot PK — Sports Venue Booking and Player Matchmaking Platform  
**Frontend target:** React.js web application (responsive desktop and mobile browsers)  
**Backend:** Existing Node.js/Express API in `FYP_PlaySpot_Node_JS_BE`  
**Design reference:** [PlaySpot PK — Web App Design in Figma](https://www.figma.com/design/DlUWCFqxHUOrwI8Q0wnh2f/PlaySpot-PK-%E2%80%94-Web-App-Design?node-id=0-1&t=5eZkLKsPnZB8djuA-1)

## 1. Project objective

Create a consistent, responsive React.js web frontend for the existing PlaySpot PK backend. Support the two implemented roles: players discover and book sports venues and use community features; vendors manage venues, courts, equipment, bookings and analytics. Reuse the supplied Figma design and the backend's actual API contract. The inspected workspace currently contains a React Native app and the backend, but no separate React.js web application. Prompt 1 therefore begins by confirming the web app location (if it has since been added) or setting up the smallest appropriate web foundation in the agreed project location. Do not treat React Native screens or components as a web implementation.

The backend root README and source under `FYP_PlaySpot_Node_JS_BE` are the source of truth for routes, authorization, DTOs and limitations. The backend exposes JSON success/error envelopes under `/api/v1`; use the existing API client conventions only after inspecting the current contract. Do not infer endpoint names from product requirements.

## 2. Scope and delivery approach

Build in eight sequential stages. Each stage should leave the web app runnable and add one coherent set of user flows. Match the Figma screens and responsive behavior where access permits, use shared web components and accessible browser controls, and provide clear loading, empty, error and success feedback. Where an API or provider is unavailable, show the actual limitation rather than a fabricated success. Keep the first delivery focused on the implemented backend features; do not add unimplemented features such as real push notifications or unsupported payment behavior.

## 3. Implementation sequence

### Stage 1 — Repository audit, web foundation and design system

**Implement:** Confirm whether a React.js web app exists; inspect its package scripts, routing, styles and current changes. If none exists, establish a minimal React.js web entry point in the appropriate frontend location without altering the React Native app. Review the Figma file and extract its shared layout, colors, type, spacing and responsive patterns. Set up the app shell, route handling, shared tokens and a small set of reusable web primitives.

**Pages/features:** Web app shell, responsive header/navigation, public landing/welcome entry and not-found route.

**Complete when:** The web app starts using its documented command, the shared visual foundation is in place, and route/component ownership is clear. Confirm existing scripts and package manager before adding dependencies.

**Expected outcome:** A clean, responsive React.js foundation aligned with the design and ready for authenticated player/vendor pages.

### Stage 2 — Authentication, account setup and role-based navigation

**Implement:** Player/vendor registration, login, session restore, logout, profile view/edit and role-aware route protection. Reuse the backend's JSON envelope, auth endpoints and token lifecycle from its current README/source. Keep credentials in the browser storage mechanism already established by the web app; never store passwords or silently use mobile AsyncStorage patterns.

**Pages/features:** Login, player registration, vendor registration, forgot-password limitation state, profile/settings and role-specific navigation shell.

**Complete when:** A player and vendor can authenticate through implemented endpoints, protected pages respect the authenticated role, refresh/session expiry is handled, and logout clears the session. Clearly explain that forgot-password currently does not send an email or OTP if the backend still has that limitation.

**Expected outcome:** Secure, usable account flows that route users to the correct player or vendor workspace.

### Stage 3 — Player discovery, search, filters and venue details

**Implement:** Venue listing and search using the implemented list/nearby APIs, with filters for sport, city/location, amenities and other query filters confirmed in backend schemas. Build venue cards, filter controls and the venue details view with courts, facilities, photos/media, equipment and reviews data. Keep map/geolocation controls honest about the currently available service and permission fallback.

**Pages/features:** Player home/discovery, search results, filter/sort controls, venue details and venue map/location view where supported by the web environment.

**Complete when:** Search/filter changes query actual backend data, venue details load by ID, and loading/empty/error states are present. No fallback fixture data should hide an API failure.

**Expected outcome:** Players can find a published venue and inspect its current details from the backend.

### Stage 4 — Reviews and player booking flow

**Implement:** Venue review display and eligible review submission, court/date availability, equipment quantities, booking summary and booking creation. Use backend validation, server-calculated prices and the shared court availability rules. Do not trust browser-supplied prices or report a booking as successful until the API confirms it.

**Pages/features:** Reviews section/form, court and time selection, add-on selection, booking checkout/confirmation.

**Complete when:** An eligible player can submit a review; a player can book an available slot; occupied slots and backend validation errors are handled clearly; totals reflect server response.

**Expected outcome:** A complete venue-to-booking path with correct availability and price feedback.

### Stage 5 — Payments and booking management

**Implement:** Player booking list/detail/cancellation and payment status. Connect only the payment methods and states exposed by current backend routes. For online checkout, follow the backend's Safepay sandbox flow and verified status behavior; support pay-at-venue and bank-transfer proof/review only as implemented. Make demo/sandbox limitations visible and never mark a payment successful based only on a redirect.

**Pages/features:** My bookings, booking detail, payment action/status, transfer instructions and receipt submission if supported.

**Complete when:** Booking history and cancellation use the authenticated user's API records; payment states refresh from the server and error/pending states are understandable.

**Expected outcome:** Players can manage reservations and see truthful payment/booking states.

### Stage 6 — Player rooms, chat, tournaments and leaderboards

**Implement:** Public/private game room discovery and membership, room creation where API allows, conversation inbox/messages, tournament browse/detail/team registration and leaderboards. Use REST for persisted state and the existing authenticated Socket.IO contract for realtime chat only if web-compatible and required; retain REST history/send behavior if realtime connection is unavailable. Do not imply split payments, push notifications or realtime behavior unsupported by current API.

**Pages/features:** Game rooms, room details, chat inbox/conversation, tournaments, tournament detail and global/tournament leaderboards.

**Complete when:** Membership/capacity and private-room errors follow server rules; messages and tournament state persist through APIs; leaderboards use returned standings; disconnected/loading states are clear.

**Expected outcome:** Player community and competition features work against backend data.

### Stage 7 — Vendor workspace and operations

**Implement:** Vendor dashboard and profile, venue/court/equipment management, facilities/media, availability, bookings, walk-ins, reviews and analytics. Use vendor-owned endpoints and signed upload/confirm flows for media; don't upload local paths as if they were stored remotely. Keep draft/publication states consistent with backend behavior.

**Pages/features:** Vendor dashboard, venue editor/list, court and equipment forms, availability calendar, booking list/detail, walk-in form, review management and analytics.

**Complete when:** Vendor-only routes are protected; venue/catalog changes persist; walk-ins share backend availability with player bookings; analytics display API results and sensible empty states.

**Expected outcome:** Vendors can manage day-to-day venue operations from the web app.

### Stage 8 — Integration, responsive polish and release verification

**Implement:** Finish cross-role navigation and consistent responsive/accessibility behavior. Exercise the critical player and vendor paths against the actual backend, fix integration defects, review error handling and document exact run/build/test commands and known limitations in the web project's existing documentation.

**Pages/features:** All implemented pages; navigation, shared components, responsive layouts and end-to-end smoke paths.

**Complete when:** Existing lint/test/typecheck/build scripts pass where present; both roles complete the critical flows; no dead primary actions or misleading mock success remain; known backend/provider constraints are listed.

**Expected outcome:** A coherent, demonstrable React.js frontend connected to the existing API and ready for handoff.

## 4. Completion checklist

- [ ] Confirmed the actual React.js project location and kept the React Native app separate.
- [ ] Reviewed Figma screens/components and applied the supplied design consistently.
- [ ] Player and vendor login, registration, session handling and route protection work.
- [ ] Player can search/filter venues, inspect details, review and book available courts.
- [ ] Player can manage bookings and see accurate payment status.
- [ ] Rooms, chat, tournaments and leaderboards use implemented backend behavior.
- [ ] Vendor can manage profile, venues, courts, facilities/media and equipment.
- [ ] Vendor can manage availability, bookings, walk-ins and analytics.
- [ ] All API routes and response structures were verified from backend source/README; none were invented.
- [ ] Loading, empty, validation, authorization, network and success states are clear.
- [ ] Responsive layouts and essential keyboard/accessibility behavior are checked.
- [ ] Existing project checks/build and critical player/vendor smoke flows were run and reported accurately.
- [ ] Known limitations, especially maps, payment sandbox, forgot-password and notifications, are stated honestly.
