# TODO App — Frontend

React + Vite frontend for the TODO App. Provides a full task management UI that communicates with the Express backend over HTTP.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later
- The backend server running locally (see [`../server/README.md`](../server/README.md))

---

## Getting Started

### 1. Install dependencies

```bash
cd client
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The app opens at `http://localhost:5173`.

The Vite dev server proxies all `/api/*` requests to `http://localhost:5000`, so no extra CORS configuration is needed during development. Make sure the backend is running before you start the frontend.

### 3. Build for production

```bash
npm run build
```

Output goes to `dist/`. Serve it with any static file host (Nginx, Vercel, Netlify, etc.). For production, point the backend's `CLIENT_URL` to your deployed frontend origin.

---

## Project Structure

```
client/
├── public/
│   └── favicon.svg            # App icon
├── src/
│   ├── api/
│   │   └── api.js             # Axios instance with auth interceptors
│   ├── context/
│   │   └── AuthContext.jsx    # Global auth state, token management
│   ├── components/
│   │   ├── AddTodoModal.jsx   # Modal form for creating a new task
│   │   ├── ConfirmModal.jsx   # Reusable confirmation dialog
│   │   ├── Navbar.jsx         # Top navigation bar
│   │   ├── ProtectedRoute.jsx # Redirects to /login if not authenticated
│   │   └── TodoItem.jsx       # Individual task row (view + inline edit)
│   ├── pages/
│   │   ├── LoginPage.jsx      # Login form
│   │   ├── RegisterPage.jsx   # Registration form
│   │   └── TodoPage.jsx       # Main dashboard
│   ├── App.jsx                # Router setup
│   ├── App.css                # All component styles
│   ├── index.css              # CSS variables, reset, base typography
│   └── main.jsx               # React entry point
├── index.html
├── vite.config.js
└── package.json
```

---

## Features

- **Register / Login** — JWT-based authentication with automatic session restore on page refresh.
- **Dashboard** — Personalized greeting, task stats (total / active / done), and a progress bar.
- **Create task** — Floating action button (bottom-right) opens an animated modal with title and optional description fields.
- **Edit task** — Click the edit icon on any task to enter inline editing mode.
- **Toggle done** — Custom circular checkbox marks a task complete; completed tasks show a strikethrough.
- **Delete task** — Trash icon triggers a confirmation dialog before deleting.
- **Filter** — Switch between All, Active, and Done tabs.
- **Sign out** — Confirmation dialog before logging out.
- **Loading and error states** — Shown for every async operation.

---

## Authentication Flow

Access tokens (15-minute lifetime) are kept in memory — never in `localStorage` — to reduce XSS exposure. Refresh tokens (7-day lifetime) live in an HTTP-only cookie managed by the server.

On every page load, the app silently calls `/api/auth/refresh` to restore the session from the cookie. If the cookie is absent or expired, the user is redirected to the login page.

If any API call returns a `401`, the Axios response interceptor automatically attempts a token refresh and retries the original request before surfacing an error to the user.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Dev server and bundler |
| React Router v7 | Client-side routing |
| Axios | HTTP client with interceptors |
| Plus Jakarta Sans | UI font (Google Fonts) |
| Custom CSS | Styling — no UI library used |

---

## Assumptions and Limitations

- **Backend must be running** at `http://localhost:5000` during development. The Vite proxy handles the `/api` prefix — no environment variables are needed in the frontend for local development.
- **No `localStorage` for tokens** — access tokens live in React state only. Refreshing the page triggers a silent re-auth via the cookie; if the cookie is gone, the user must log in again.
- **Single user per session** — the app does not support multiple simultaneous accounts in the same browser.
- **No offline support** — all operations require a live connection to the backend.
- **Minimum password length is 6 characters** on the frontend form; the backend enforces 8 characters. The backend validation is the authoritative rule.
