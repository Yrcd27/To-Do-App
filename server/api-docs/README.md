# API Documentation — TODO App

This folder contains a ready-to-use Postman collection and environment for testing every endpoint of the TODO App backend.

---

## Files

| File | Purpose |
|---|---|
| `todo-app.postman_collection.json` | All API requests, organized in folders, with test scripts |
| `todo-app.postman_environment.json` | Environment variables (`base_url`, `access_token`, `todo_id`) |

---

## How to Import

### Postman (Desktop or Web)

1. Open Postman.
2. Click **Import** (top-left).
3. Drag and drop **both files** at once, or click **Upload Files** and select them.
4. The collection `TODO App API` and environment `TODO App - Local` will appear.
5. Select **TODO App - Local** from the environment dropdown (top-right corner).

### Thunder Client (VS Code extension)

1. Open Thunder Client → **Collections** tab → **Import**.
2. Import `todo-app.postman_collection.json`.
3. Set the base URL manually in each request or use Thunder Client's environment feature.

---

## How to Use

The collection is self-wiring. You only need to run two requests manually — everything else is automatic.

### Step 1 — Start the server

```bash
cd server
npm run dev
```

### Step 2 — Register or Login

Run either **Auth / Register** or **Auth / Login**.

The test script automatically saves `access_token` to the environment. Every protected request in the **Todos** folder picks it up via the collection-level Bearer auth.

### Step 3 — Create a Todo

Run **Todos / Create Todo**.

The test script saves the new todo's `_id` to `todo_id`. The Update, Toggle Done, and Delete requests all use `{{todo_id}}` in their URL — no copy-pasting needed.

### Step 4 — Run any other request

All requests in the **Todos** folder are ready to go.

---

## Collection Structure

```
TODO App API
├── Health Check                         GET  /
├── Auth
│   ├── Register                         POST /api/auth/register   → saves access_token
│   ├── Login                            POST /api/auth/login      → saves access_token
│   ├── Get My Profile                   GET  /api/auth/me
│   ├── Refresh Token                    POST /api/auth/refresh    → rotates access_token
│   └── Logout                           POST /api/auth/logout     → clears access_token, todo_id
├── Todos                                (all inherit Bearer {{access_token}})
│   ├── Get All Todos                    GET    /api/todos
│   ├── Create Todo                      POST   /api/todos         → saves todo_id
│   ├── Create Todo (title only)         POST   /api/todos
│   ├── Update Todo                      PUT    /api/todos/{{todo_id}}
│   ├── Toggle Done                      PATCH  /api/todos/{{todo_id}}/done
│   └── Delete Todo                      DELETE /api/todos/{{todo_id}} → clears todo_id
└── Error Cases
    ├── Register — Missing Fields        400
    ├── Register — Duplicate Email       409
    ├── Register — Short Password        400
    ├── Login — Wrong Password           401
    ├── Access Protected Route — No Token      401
    ├── Access Protected Route — Invalid Token 401
    ├── Create Todo — Missing Title      400
    ├── Update Todo — No Fields Provided 400
    ├── Get Todo — Invalid ID Format     400  (Mongoose CastError)
    ├── Get Todo — Not Found             404
    └── Unknown Route                    404  (notFound middleware)
```

---

## Environment Variables

| Variable | Type | Set by | Description |
|---|---|---|---|
| `base_url` | default | You (on import) | Server base URL — default is `http://localhost:5000` |
| `access_token` | secret | Test scripts | JWT access token — set on Register/Login, cleared on Logout |
| `todo_id` | default | Test scripts | `_id` of the last created TODO — set on Create, cleared on Delete |

---

## Test Scripts

Every request has an automated test script. You can run the entire collection at once using Postman's **Collection Runner** (click the collection → **Run collection**) to get a pass/fail report for all endpoints in one go.

The Error Cases folder is designed to assert `success: false` and the correct HTTP status code, so the runner treats expected errors as passing tests.

---

## Switching to a Different Environment

To test against a deployed backend, duplicate the `TODO App - Local` environment, rename it (e.g. `TODO App - Production`), and change `base_url` to your hosted URL. No changes to the collection are needed.
