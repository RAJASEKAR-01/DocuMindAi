# DocuMind AI

**AI Document Intelligence Platform** — upload any contract or document (rental agreement, offer letter, loan contract, NDA) and get an instant AI-powered summary, risk score, flagged clauses, suggested questions, recommendations, and a chat interface to ask follow-up questions grounded strictly in the document.

Built on the MERN stack with Google Gemini, using a modern production-grade architecture: MVC + service layer on the backend, feature-based structure with Redux Toolkit (auth/session only) + TanStack Query (all server state) on the frontend.

---

## Architecture

### Why this structure

- **Redux Toolkit is used ONLY for auth/session state** (`user`, `accessToken`). Everything else — documents, chat, analytics — is server state owned entirely by **TanStack Query**, which handles caching, background refetching, and loading/error states automatically. This avoids the classic anti-pattern of Redux trying to mirror server data.
- **Backend follows MVC + a service layer**: routes are thin, controllers only orchestrate request/response, and all business logic (Gemini prompting, PDF parsing, email sending) lives in `services/`. This keeps controllers readable and services independently testable.
- **JWT access + refresh token rotation**: short-lived access tokens (15 min) are kept in memory (Redux) — never localStorage, to reduce XSS exposure. The refresh token lives in an httpOnly cookie and is rotated on every use. An Axios interceptor transparently refreshes an expired access token and retries the original request, queueing any concurrent requests during the refresh.
- 
<img width="1877" height="888" alt="Screenshot 2026-07-06 110130" src="https://github.com/user-attachments/assets/55ff14e2-f76d-4801-aa85-a2a4f20b2671" />
```
DocuMindAI/
├── server/                      # Express API (MVC + services)
│   ├── config/                  # DB + Cloudinary config
│   ├── models/                  # Mongoose schemas (User, Document, ChatMessage)
│   ├── middleware/               # auth, upload (multer), validate (zod), errorHandler
│   ├── controllers/              # thin request/response orchestration
│   ├── services/                 # geminiService, pdfService, emailService (business logic)
│   ├── routes/                   # authRoutes, documentRoutes, chatRoutes, analyticsRoutes
│   ├── validators/                # zod schemas for request validation
│   ├── utils/                    # asyncHandler, generateTokens
│   └── server.js
│
├── client/                      # React 19 + Vite
│   └── src/
│       ├── app/store.js          # Redux store (auth/session state only)
│       ├── features/             # feature-based structure
│       │   ├── auth/             # authSlice, authApi, useAuth hooks
│       │   ├── documents/        # documentsApi, useDocuments hooks (React Query)
│       │   ├── chat/             # chatApi, useChat hooks
│       │   └── analytics/        # analyticsApi, useAnalytics hooks
│       ├── pages/                 # Landing, Login, Register, Dashboard, Upload,
│       │                          # Analysis, Chat, History, Profile, NotFound
│       ├── components/
│       │   ├── layout/            # Navbar, AppLayout, ProtectedRoute
│       │   ├── common/            # RiskBadge, RiskGauge, EmptyState
│       │   └── skeletons/         # CardSkeleton, TableSkeleton
│       ├── lib/axios.js           # Axios instance + refresh-token interceptor
│       └── routes/AppRoutes.jsx
└── README.md
```

---

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, Redux Toolkit, TanStack Query, React Router, Axios, Framer Motion, React Hook Form, Zod, React Markdown, Heroicons, react-hot-toast (toast notifications)

**Backend:** Node.js, Express.js, MongoDB Atlas, Mongoose, JWT (access + refresh), Multer, pdf-parse, Google Gemini API, Cloudinary, Nodemailer, Zod (request validation), express-rate-limit

> **Note on Tailwind version:** v3.4 was used deliberately instead of v4 for stability — v4's config format changed significantly and v3 has the most mature ecosystem support as of this build.
> **Note on react-hot-toast:** the spec called for "toast notifications" without naming a library; react-hot-toast was chosen for its small footprint and clean React 19 compatibility.

---

## Features

| Feature | Details |
|---|---|
| Auth | Register/login, JWT access + refresh token rotation, protected routes |
| Upload | Drag-and-drop PDF upload, 10MB limit, client + server-side validation |
| AI Analysis | Summary, risk score (0-100), risk level, flagged clauses, "Explain Like I'm 15", suggested questions, recommendations |
| Chat with Document | Ask follow-up questions; answers are grounded strictly in the extracted document text |
| History | Paginated list of all analyzed documents with risk badges |
| Analytics Dashboard | Total documents, average risk score, risk-level breakdown, document-type breakdown |
| Download Report | Plain-text AI report download per document |
| Profile | Update name and avatar |

---

## Getting Started

### Prerequisites
- Node.js v18+
- A MongoDB Atlas cluster (or local MongoDB)
- A Google Gemini API key ([aistudio.google.com](https://aistudio.google.com) — keys start with `AIzaSy`)
- (Optional but recommended) A Cloudinary account for storing uploaded PDFs
- (Optional) SMTP credentials for welcome/analysis-ready emails — the app works fine without these; emails just won't send (failures are logged, never block the request)

### 1. Backend setup

```bash
cd server
npm install
cp .env.example .env
# Fill in MONGO_URI, JWT secrets, GEMINI_API_KEY, and optionally Cloudinary/SMTP
npm run dev
```

The API will run on `http://localhost:5000`. Check `http://localhost:5000/api/health` to confirm it's up.

### 2. Frontend setup

```bash
cd client
npm install
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:5000
npm run dev
```

The app will run on `http://localhost:5173`.

### 3. Generating your Gemini API key
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Create an API key (it will start with `AIzaSy`)
3. Paste it into `server/.env` as `GEMINI_API_KEY`

---

## Deployment

### Backend → Render
1. Push this repo to GitHub
2. Create a new **Web Service** on Render, point it at the `server/` directory (set root directory to `server`)
3. Build command: `npm install` · Start command: `npm start`
4. Add all environment variables from `server/.env.example` in Render's dashboard
5. Set `CLIENT_URL` to your deployed Vercel URL (needed for CORS + cookies)

### Frontend → Vercel
1. Import the repo into Vercel, set root directory to `client`
2. Framework preset: Vite
3. Add environment variable `VITE_API_BASE_URL` = your Render backend URL
4. Deploy

### Database → MongoDB Atlas
Standard free-tier M0 cluster works fine. Whitelist `0.0.0.0/0` (or Render's IPs) in Network Access.

### Cross-origin cookies note
Since the frontend and backend are on different domains in production, the refresh-token cookie is set with `sameSite: "none"` and `secure: true` in production (already handled in `authController.js`) — this requires both domains to be served over HTTPS, which Vercel and Render provide by default.

---

## Security Notes

- Passwords are hashed with bcrypt (10 salt rounds), never returned in API responses (`select: false` on the schema field)
- Access tokens are short-lived (15 min) and kept only in memory (Redux), not localStorage
- Refresh tokens are httpOnly cookies, rotated on every refresh, and tracked per-user (last 5 sessions) so old tokens can't be replayed after rotation
- All inputs are validated server-side with Zod, regardless of client-side validation
- Rate limiting is applied globally and more strictly on `/api/auth/*`

---

## Author

**Rajasekar**
Full Stack Developer | AI-Integrated Web Applications
[Portfolio](https://rajasekar-modern-portfolio.vercel.app) · [GitHub](https://github.com/RAJASEKAR-01) · [LinkedIn](https://linkedin.com/in/rajasekar-developer)
