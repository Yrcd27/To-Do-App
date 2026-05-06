# TODO App

A full-stack TODO application built with React, Node.js, Express, and MongoDB.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (access + refresh tokens) |

---

## Project Structure

```
to-do-app/
├── client/     # React frontend
└── server/     # Express backend
```

---

## Quick Start

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # fill in your values
npm run dev            # runs on http://localhost:5000
```

See [`server/README.md`](./server/README.md) for full setup instructions and environment variable details.

### 2. Frontend

```bash
cd client
npm install
npm run dev            # runs on http://localhost:5173
```

See [`client/README.md`](./client/README.md) for full setup instructions.

> The frontend proxies all `/api` requests to the backend automatically — no extra configuration needed for local development.

---

## API Documentation

Full API reference with request/response examples:

**[View API Docs →](https://documenter.getpostman.com/view/45183777/2sBXqMHyvP)**

A Postman collection and environment file are also available locally in [`server/api-docs/`](./server/api-docs/README.md).

---

## Features

- Register and log in with secure JWT authentication
- Create tasks with a title and optional description
- Edit, delete, and mark tasks as done
- Filter tasks by All / Active / Done
- Progress bar showing overall completion
- Confirmation dialogs for destructive actions
