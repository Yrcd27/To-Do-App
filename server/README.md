# TODO App — Backend

Express.js REST API for the TODO App. Handles authentication and full CRUD for todos, backed by MongoDB Atlas.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier is enough) or a local MongoDB instance

---

## Getting Started

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Create the environment file

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set each variable (see [Environment Variables](#environment-variables) below).

### 3. Start the development server

```bash
npm run dev
```

The server starts on `http://localhost:5000` (or the port you set in `.env`).

To run in production mode:

```bash
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Port the server listens on. Defaults to `5000`. |
| `MONGO_URI` | **Yes** | Full MongoDB connection string (Atlas or local). |
| `CLIENT_URL` | **Yes** | Frontend origin allowed by CORS. E.g. `http://localhost:5173`. |
| `NODE_ENV` | No | Set to `production` to enable secure cookies and stricter rate limits. |
| `JWT_ACCESS_SECRET` | **Yes** | Secret for signing access tokens. Use a long random hex string. |
| `JWT_REFRESH_SECRET` | **Yes** | Secret for signing refresh tokens. Must differ from the access secret. |
| `JWT_ACCESS_EXPIRES` | No | Access token lifetime. Defaults to `15m`. |
| `JWT_REFRESH_EXPIRES` | No | Refresh token lifetime. Defaults to `7d`. |

**Generating secrets:**

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run this twice — once for `JWT_ACCESS_SECRET`, once for `JWT_REFRESH_SECRET`.

---

## MongoDB Connection

### Atlas (recommended)

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Create a database user with read/write access.
3. Whitelist your IP (or use `0.0.0.0/0` for development).
4. Click **Connect → Drivers** and copy the connection string.
5. Replace `<password>` with your database user's password and paste it as `MONGO_URI` in `.env`.

Example:
```
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/todo_app?retryWrites=true&w=majority
```

### Local MongoDB

```
MONGO_URI=mongodb://localhost:27017/todo_app
```

---

## API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Create a new account |
| POST | `/api/auth/login` | None | Log in, receive access token |
| POST | `/api/auth/refresh` | Cookie | Rotate refresh token, get new access token |
| POST | `/api/auth/logout` | Cookie | Invalidate refresh token |
| GET | `/api/auth/me` | Bearer | Get the authenticated user's profile |

### Todos — `/api/todos` *(all require Bearer token)*

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/todos` | Get all todos for the logged-in user |
| POST | `/api/todos` | Create a new todo |
| PUT | `/api/todos/:id` | Update a todo's title and/or description |
| PATCH | `/api/todos/:id/done` | Toggle the done status |
| DELETE | `/api/todos/:id` | Delete a todo |

> Full request/response examples are in [`api-docs/`](./api-docs/README.md), along with a ready-to-use Postman collection.

---

## Project Structure

```
server/
├── api-docs/                  # Postman collection + environment
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Register, login, refresh, logout, me
│   │   └── todoController.js  # CRUD + toggle done
│   ├── middleware/
│   │   ├── auth.js            # JWT Bearer token guard
│   │   ├── errorHandler.js    # Global error handler
│   │   └── notFound.js        # 404 handler
│   ├── models/
│   │   ├── User.js            # User schema (bcrypt, JWT methods)
│   │   └── Todo.js            # Todo schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── todoRoutes.js
│   └── app.js                 # Express app setup (middleware, routes)
├── .env.example
├── .gitignore
├── package.json
└── server.js                  # Entry point — connects DB, starts server
```

---

## Security Features

- **Password hashing** — bcryptjs with salt rounds of 12.
- **Dual-token auth** — short-lived access token (15 min) in memory; long-lived refresh token (7 days) in an HTTP-only `SameSite=Strict` cookie.
- **Refresh token rotation** — every `/refresh` call issues a new pair and invalidates the old one. Reuse detection is built in.
- **Server-side logout** — refresh token is nulled in the database on logout, making it immediately invalid.
- **Helmet** — sets 15+ security-related HTTP headers.
- **Rate limiting** — 100 req / 15 min globally; 10 req / 15 min on auth routes in production.
- **NoSQL injection prevention** — `express-mongo-sanitize` strips `$` and `.` from inputs.
- **User-scoped queries** — all todo queries filter by `req.user._id`, preventing cross-user data access.
- **No user enumeration** — login always returns the same generic error for wrong email or password.

---

## Assumptions and Limitations

- **Authentication is required** — all todo operations require a logged-in user. The PDF did not specify auth, but it was added as a security best practice and to scope todos per user.
- **No email verification** — accounts are active immediately after registration.
- **No password reset flow** — outside the scope of this assignment.
- **Single MongoDB database** — no multi-tenancy; each Atlas free cluster is sufficient.
- **CORS is restricted** to the single `CLIENT_URL` origin. Update this variable when deploying to production.
- **Rate limits are relaxed in development** — auth routes allow 100 req / 15 min in `NODE_ENV=development` vs. 10 in production, to avoid friction during local testing.
