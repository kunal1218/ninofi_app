# NINOFI

**Milestone-based escrow, contracts, and GPS check-ins for home renovation.**

NINOFI is a mobile-first platform for homeowners, contractors, and workers. It combines milestone tracking, digital contracts, GPS check-ins, messaging, and payout readiness to keep projects transparent and on schedule.

---

## Highlights
- 🔒 **Escrow-ready milestones**: Create, fund (UI), submit, and approve milestones.
-, 📍 **GPS check-in**: Workers verify on-site presence against stored job-site coordinates.
-, 📸 **Evidence capture**: Photo uploads with submissions.
-, 📝 **Contracts**: Create, view, sign, and manage per project.
-, 💬 **Messaging & notifications**: In-app chat and alerts.
-, 👤 **Role-specific dashboards**: Homeowner, contractor, and worker flows.
-, 💰 **Stripe Connect (contractors)**: Required for payout-related flows.

---

## Tech Stack
**Frontend**
- React Native with Expo (Expo Router)
- React Navigation 6.x inside Expo Router tabs
- Redux Toolkit + Redux Persist
- Expo Image Picker, Expo Location, Expo Camera
- Axios (`EXPO_PUBLIC_API_URL` configurable)

**Backend**
- Node.js + Express (`/server`)
- PostgreSQL
- JWT auth
- Stripe Connect onboarding for contractors
- RESTful API (deployed on Railway by default)

---

## Project Structure
```
ninofi/
├── app/                     # Expo Router entry (tabs + modal)
├── src/
│   ├── navigation/          # AppNavigator (React Navigation stack)
│   ├── screens/             # auth / homeowner / contractor / worker / shared
│   ├── components/          # UI bits + CheckInButton
│   ├── services/            # API clients (axios), feature services
│   ├── store/               # Redux slices (auth, projects, invoices, notifications)
│   └── styles/              # palette, theme
├── server/                  # Express API (Railway-ready)
├── package.json
└── README.md
```

---

## Getting Started
### Prereqs
- Node 16+
- npm or yarn
- Expo CLI (bundled via `npx expo`)
- iOS simulator / Android emulator or Expo Go on device

### App
```bash
npm install
npm start   # expo dev server
```
Run: press `i` (iOS), `a` (Android), or scan QR with Expo Go.

### API (optional local)
```bash
cd server
npm install
npm start   # starts Express on PORT (default 8081)
```
Set `EXPO_PUBLIC_API_URL` to your API (e.g., `http://localhost:8081/api` or the Railway URL) and restart the Expo app.

---

## Role Flows
**Homeowner**
- Create project (3-step wizard), verify job-site location (geocode or current location), set milestones.
- Fund UI, track progress, review/approve submitted milestones.
- Manage contracts and messaging.

**Contractor**
- Browse/apply to projects; chat with owners.
- Submit milestones with evidence; manage contracts.
- Connect Stripe for payouts.

**Worker**
- View assigned gigs/projects.
- GPS check-in at job site (worker-only entry point is inside the project screen).
- Submit work proof; track pending/approved tasks.

---

## GPS & Check-Ins
- Projects store `job_site_latitude`, `job_site_longitude`, and `check_in_radius` (default 200m + tolerance).
- Worker check-ins hit `/api/check-in` and `/api/check-in-status`.
- Check-in UI: `src/components/CheckInButton.js` (base URL from `EXPO_PUBLIC_API_URL`).
- Worker-facing check-in lives inside the worker project screen; list-level check-ins were removed.

---

## Stripe Notes
- Contractor payout-related endpoints require a connected Stripe account.
- Use “Connect Bank” (Stripe Connect onboarding) from the contractor dashboard to clear “Stripe account not connected” responses.

---

## Current Status
- Frontend: Auth, role dashboards, project creation with geocode/current-location capture, milestone submission/review UI, contracts, notifications, worker check-in flow.
- Backend: Express + Postgres on Railway; project create/update persists job-site coords; check-ins stored with distance validation; Stripe Connect onboarding supported for contractors.

---

## Future Improvements
- Wire worker submissions to auto-flag milestones as `submitted` (optional).
- Harden payout/release flows and add push notifications/real-time messaging.
