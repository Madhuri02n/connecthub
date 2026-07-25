# ConnectHub

A full-stack social media web application built on the MERN stack — share photo posts, follow people, like and comment in real time, and get notified instantly when someone engages with your content.

**Live demo:** _add your Vercel URL here after deploying_
**API base:** _add your Render URL here after deploying_

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [CI/CD Pipeline](#cicd-pipeline)
- [Deployment](#deployment)
- [Security](#security)
- [Known Limitations & Future Improvements](#known-limitations--future-improvements)
- [License](#license)

---

## Overview

ConnectHub is a production-shaped social media platform: users register, build a profile, post photos with captions and hashtags, follow other users, and interact through likes, comments, bookmarks, and shares. Notifications arrive in real time over Socket.IO, and an admin dashboard gives moderators visibility into users, posts, and platform-wide stats.

The project follows an MVC architecture on the backend and a component/context-driven architecture on the frontend, with a consistent "darkroom / contact sheet" visual identity across the UI.

---

## Features

**Authentication**
- Register, log in, log out
- JWT-based sessions (httpOnly cookie + bearer token fallback)
- Forgot / reset password flow with time-limited, hashed tokens
- Protected routes on both client and server

**Profiles**
- Upload/replace profile picture (via Cloudinary)
- Edit name, username, bio
- Follower / following / post counts

**Feed & Posts**
- Paginated feed with infinite scroll
- Create post with image + caption, live preview before upload
- Auto-extracted hashtags from captions
- Edit caption / delete own post (soft delete)
- Like / unlike, comment / delete own comment, share (copy link + share count), bookmark

**Search**
- Search users by name/username
- Search posts by caption or hashtag

**Notifications**
- Like, comment, and follow notifications
- Delivered in real time via Socket.IO, with a live unread badge
- Mark as read / mark all as read

**Follow system**
- Follow / unfollow
- Suggested users to follow

**Bonus features implemented**
- Real-time chat transport (Socket.IO, authenticated, ready for a chat UI)
- Real-time notifications (not just chat)
- Bookmarks
- Hashtags (auto-extracted)
- Trending posts (aggregation-based engagement scoring over the last 7 days)

**UX**
- Dark mode (persisted, respects OS preference on first load)
- Fully responsive
- Toast notifications for every user action
- Loading skeletons (feed, profile header, user rows)
- Custom 404 page

**Admin**
- View all users, paginated
- Deactivate / reactivate user accounts
- Delete inappropriate posts (hard delete + Cloudinary cleanup)
- Dashboard statistics (users, posts, comments, 30-day growth)

---

## Tech Stack

**Frontend:** React 19, Vite, React Router DOM, Tailwind CSS, Axios, React Hook Form, Context API, Socket.IO client, lucide-react, react-hot-toast

**Backend:** Node.js, Express.js, MongoDB Atlas, Mongoose, JWT, bcryptjs, Multer, Cloudinary, Socket.IO, dotenv, CORS

**Security middleware:** Helmet, express-rate-limit, express-mongo-sanitize, xss-clean, hpp, express-validator

**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

**CI/CD:** GitHub Actions

---

## Folder Structure

```
connecthub/
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── client/
│   ├── src/
│   │   ├── components/       # Reusable UI (PostCard, Navbar, Avatar, Skeletons, ...)
│   │   ├── pages/            # Route-level views
│   │   ├── context/          # AuthContext, ThemeContext, SocketContext
│   │   ├── services/         # Axios-based API modules
│   │   ├── hooks/             # useDebounce, useInfiniteScroll, useNotificationCount
│   │   ├── layouts/          # MainLayout, AuthLayout
│   │   ├── utils/            # timeAgo, etc.
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json
│   └── package.json
├── server/
│   ├── config/                # db.js, cloudinary.js
│   ├── controllers/           # auth, user, post, notification, admin
│   ├── middleware/            # auth, upload, errorHandler, validators
│   ├── models/                 # User, Post, Comment, Notification
│   ├── routes/
│   ├── utils/                  # ApiError, generateToken
│   ├── uploads/                 # local dev only; production uses Cloudinary
│   ├── app.js
│   ├── server.js
│   └── package.json
├── render.yaml
└── README.md
```

---

## Architecture

- **MVC on the backend:** Models (Mongoose schemas) → Controllers (business logic) → Routes (thin, declarative endpoint definitions). Middleware handles cross-cutting concerns (auth, validation, uploads, error formatting).
- **Soft delete for posts:** posts are flagged `isDeleted` rather than removed on user-initiated delete, preserving an audit trail; admin moderation performs a hard delete with Cloudinary cleanup.
- **Image handling:** Multer uses in-memory storage; buffers are streamed directly to Cloudinary, so the app never writes to local disk in production (important on Render's ephemeral filesystem).
- **Real-time layer:** a single Socket.IO server, authenticated with the same JWT used for REST calls. Each connected user joins a room keyed by their own user ID, so the backend can target them directly (`io.to(userId).emit(...)`) for notifications and chat.
- **Client state:** three React contexts — `AuthContext` (session), `ThemeContext` (dark mode), `SocketContext` (live connection) — rather than a heavier state library, since the app's shared state surface is small and well-scoped.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB for development)
- A Cloudinary account (free tier is fine)

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/connecthub.git
cd connecthub

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

```bash
# from the server/ directory
cp .env.example .env
# fill in MONGO_URI, JWT_SECRET, CLOUDINARY_* credentials

# from the client/ directory
cp .env.example .env
# set VITE_API_URL to http://localhost:5000/api for local dev
```

### 3. Run locally

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

The client runs at `http://localhost:5173`, the API at `http://localhost:5000`.

---

## Environment Variables

**`server/.env`**

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Backend port (default `5000`) |
| `CLIENT_URL` | Frontend origin, used for CORS and Socket.IO |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `JWT_COOKIE_EXPIRES_DAYS` | Cookie expiry in days |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | Global rate-limiter tuning |

**`client/.env`**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

---

## API Documentation

Base URL: `/api`

### Auth (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create an account |
| POST | `/login` | Public | Log in |
| POST | `/logout` | Private | Clear the auth cookie |
| GET | `/me` | Private | Get the current user |
| POST | `/forgot-password` | Public | Request a reset token |
| PUT | `/reset-password/:token` | Public | Reset password with a valid token |

### Users (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/profile` | Private | Get my profile |
| PUT | `/profile` | Private | Update name/username/bio |
| PUT | `/profile/picture` | Private | Upload profile picture |
| GET | `/search?q=` | Public | Search users |
| GET | `/suggestions` | Private | Suggested users to follow |
| POST | `/follow/:id` | Private | Follow a user |
| POST | `/unfollow/:id` | Private | Unfollow a user |
| GET | `/:username` | Public | Get a public profile |

### Posts (`/api/posts`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/?page=&limit=&author=` | Public | Paginated feed, optional author filter |
| POST | `/` | Private | Create a post (multipart, field `image`) |
| GET | `/search?q=` | Public | Search posts by caption/hashtag |
| GET | `/trending` | Public | Trending posts (last 7 days) |
| GET | `/:id` | Public | Get a single post |
| PUT | `/:id` | Private | Edit caption (owner only) |
| DELETE | `/:id` | Private | Delete post (owner/admin, soft delete) |
| POST | `/:id/like` / `/:id/unlike` | Private | Like / unlike |
| POST | `/:id/comment` | Private | Add a comment |
| DELETE | `/:postId/comment/:commentId` | Private | Delete own comment |
| POST | `/:id/share` | Private | Increment share count |
| POST | `/:id/bookmark` | Private | Toggle bookmark |

### Notifications (`/api/notifications`) — all Private
| Method | Endpoint | Description |
|---|---|---|
| GET | `/?page=&limit=` | Paginated notifications + unread count |
| PUT | `/:id/read` | Mark one as read |
| PUT | `/read-all` | Mark all as read |

### Admin (`/api/admin`) — all Private/Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/stats` | Dashboard statistics |
| GET | `/users?page=&limit=` | List all users |
| PUT | `/users/:id/toggle-active` | Ban / reactivate a user |
| DELETE | `/posts/:id` | Hard-delete a post |

### Socket.IO events
| Event | Direction | Payload |
|---|---|---|
| `notification` | server → client | `{ type: 'like'\|'comment'\|'follow', from, postId? }` |
| `chat:message` | client → server → client | `{ toUserId, message }` |

---

## CI/CD Pipeline

Defined in `.github/workflows/ci-cd.yml`, triggered on every push/PR to `main`:

1. **`backend-checks`** — installs backend deps, syntax-checks every `.js` file, runs the test script.
2. **`frontend-build`** — installs frontend deps, lints, builds the production bundle, uploads it as a workflow artifact.
3. **`deploy`** (only on a push to `main`, only after both jobs above pass) — deploys the frontend to Vercel via the Vercel CLI action, then pings a Render deploy hook to redeploy the backend.

**Required GitHub Actions secrets** (Settings → Secrets and variables → Actions):

| Secret | Where to get it |
|---|---|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens |
| `VERCEL_ORG_ID` | `client/.vercel/project.json` after running `vercel link` once locally |
| `VERCEL_PROJECT_ID` | Same file as above |
| `VITE_API_URL` | Your deployed Render backend URL + `/api` |
| `RENDER_DEPLOY_HOOK_URL` | Render dashboard → your service → Settings → Deploy Hook |

---

## Deployment

### Frontend → Vercel
1. Import the repo in the Vercel dashboard, set the root directory to `client`.
2. Vercel auto-detects the Vite framework and `vercel.json`'s SPA rewrite.
3. Add `VITE_API_URL` as a Vercel project environment variable.
4. Run `vercel link` locally once to generate `.vercel/project.json`, and copy the org/project IDs into your GitHub secrets for the CI/CD pipeline above.

### Backend → Render
1. Either connect the repo and let Render read `render.yaml` (Blueprint deploy), or create a Web Service manually with root directory `server`, build command `npm install`, start command `npm start`.
2. Fill in the secret environment variables Render prompts for (`MONGO_URI`, `CLIENT_URL`, Cloudinary credentials).
3. Copy the service's Deploy Hook URL into the `RENDER_DEPLOY_HOOK_URL` GitHub secret.

### Database → MongoDB Atlas
1. Create a free M0 cluster, add a database user, and allow network access from anywhere (`0.0.0.0/0`) or Render's specific IPs.
2. Copy the connection string into `MONGO_URI`.

---

## Security

- Passwords hashed with bcrypt (12 salt rounds), never returned in API responses
- JWTs delivered as httpOnly cookies (primary) with a bearer-token fallback
- Rate limiting: a global limiter plus a stricter limiter on auth endpoints
- Helmet for secure HTTP headers
- `express-mongo-sanitize` strips NoSQL-injection operators from input
- `express-validator` on every write endpoint
- CORS scoped to the deployed frontend origin only
- Environment variables for all secrets; nothing sensitive is committed

**Known trade-off:** `xss-clean` is an unmaintained package. It's included for defense-in-depth, but don't rely on it alone — always escape/encode user content on render.

---

## Known Limitations & Future Improvements

- Password-reset emails are stubbed (token generation/storage is implemented; wiring to an email provider like SendGrid or SES is left as a follow-up).
- No automated frontend/backend test suite yet beyond syntax checks — adding Jest/Supertest for the API and Vitest/React Testing Library for components would be the next investment.
- Chat has a working real-time transport (Socket.IO) but no dedicated UI yet — the event contract (`chat:message`) is ready to build against.
- Admin post moderation isn't yet exposed as a UI action outside the post owner's own controls.
- AI-generated captions (bonus feature) were not implemented in this pass.

---

## License

MIT
