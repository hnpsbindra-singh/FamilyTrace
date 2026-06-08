# FamilyTrace - React Vite Frontend

A real-time family location tracker frontend for the Spring Boot backend.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Backend Requirement

The Spring Boot backend must be running on `http://localhost:8080`.

The Vite dev server proxies:
- `/api/*` -> `http://localhost:8080/api/*`
- `/ws` -> WebSocket at `http://localhost:8080/ws`

## Features

- **Auth**: Register, login, OTP email verification, forgot/reset password
- **Families**: Create, join by code, view details, leave
- **Live Map**: Real-time member locations via WebSocket using STOMP over SockJS
- **Share Location**: Browser Geolocation API plus WebSocket push every 5 seconds
- **Messaging**: Send email messages to family members

## Project Structure

```text
src/
  context/       # Auth and Toast providers
  hooks/         # useWebSocket, useGeolocation
  pages/         # Login, Register, ForgotPassword, Dashboard, Family, Map
  components/    # Layout sidebar nav
  services/      # axios API client
```

## Build for Production

```bash
npm run build
```

Output goes to `dist/`. For Docker deployment, the nginx image serves this build and proxies `/api` and `/ws` to the backend container.
