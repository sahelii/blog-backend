# StoryHub – Backend API

Production-ready Node.js/Express API powering the StoryHub blogging platform: posts, comments, authentication, pagination, and caching.

### Features

- **Posts**: create, update, delete, and list posts with images, tags, and pagination.
- **Authentication**: Firebase ID tokens verified via Firebase Admin; users synced into MongoDB.
- **Comments**: add and delete comments per post, with authorization checks.
- **Security**: helmet, CORS allowlist, rate limiting, mongo-sanitize, xss-clean, HPP.
- **Observability**: `/health` (DB/Redis status) and `/metrics` (basic request metrics).
- **Docs**: Swagger UI exposed at `/api-docs`.

### Tech stack

- **Node.js 20**, **Express**
- **MongoDB** with **Mongoose**
- **Firebase Admin** for auth
- **Redis** (optional) for caching

### Getting started

```bash
git clone https://github.com/sahelii/blog-backend.git
cd blog-backend
npm install
```

Create a `.env` file (or set env vars however you prefer):

```bash
PORT=5000
MONGO_URI=mongodb+srv://...

# Firebase Admin service account pieces
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=...

# Optional
REDIS_URL=redis://localhost:6379
CORS_ALLOWED_ORIGINS=https://blog-frontend-sigma-ecru.vercel.app
```

Run locally:

```bash
npm start         # or: npm run dev
```

### Core endpoints

- **GET `/api/posts`** – list posts (paginated, optional search).
- **GET `/api/posts/:id`** – post detail (with comments).
- **GET `/api/posts/my-blogs`** – posts by authenticated user.
- **POST `/api/posts`** – create post (auth required).
- **POST `/api/comments/:id/comment`** – add comment to post (auth required).
- **GET `/health`** – service health.
- **GET `/metrics`** – basic metrics.
- **GET `/api-docs`** – Swagger UI.

### Live deployment

- **Backend API**: https://blog-backend-2-5hun.onrender.com  
- **Frontend**: https://blog-frontend-sigma-ecru.vercel.app

