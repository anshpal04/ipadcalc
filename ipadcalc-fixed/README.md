# iPadCalc

An iPad-style handwriting canvas that turns handwritten math (equations,
expressions, variable assignments) into computed answers, using Gemini for
the actual reading/solving.

- **Frontend:** React 19 + TypeScript + Vite, canvas drawing, simple
  email/password login.
- **Backend:** FastAPI, SQLAlchemy (SQLite) for users, bcrypt for password
  hashing, Gemini for reading the canvas.

## What's implemented

- Draw equations on the canvas, hit **Calculate**, get the result rendered
  next to your handwriting.
- Sign up / log in (email + password, bcrypt-hashed, stored in SQLite).
- Variables persist across calculations: draw `x = 5` in one stroke, then
  `x + 2` later, and the server remembers `x` for you (see
  `backend/session_store.py` — it's a plain in-memory dict, deliberately
  simple, and resets when the server restarts).

## Running it locally

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # then put your real GEMINI_API_KEY in .env
python main.py
```
Backend runs on http://localhost:8900.

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env   # defaults to localhost:8900, fine for local dev
npm run dev
```
Frontend runs on http://localhost:5173.

**Or, both at once with Docker:**
```bash
GEMINI_API_KEY=your-key docker compose up --build
```

## Deploying

- **Frontend → Vercel:** import the repo, set the project root to
  `frontend`, framework preset "Vite", and add an environment variable
  `VITE_API_URL` pointing at your deployed backend URL.
- **Backend → Render/Railway (not Vercel):** Vercel's serverless functions
  don't suit this backend well — it uses SQLite (a real file on disk) and
  keeps in-memory session state, neither of which survives serverless
  cold starts. Render or Railway can run the FastAPI app continuously as
  a normal process instead. Point it at `backend/Dockerfile`, set
  `GEMINI_API_KEY` and `FRONTEND_ORIGIN` (your Vercel URL) as environment
  variables.

## A 2–4 day plan to actually learn this project

**Day 1 — Backend basics**
- Read `backend/main.py` top to bottom. Understand: what does `/calculate`
  receive, what does it return, why does the image arrive as base64?
- Read `backend/models.py` + `backend/database.py`. Understand what
  SQLAlchemy's `Base`, `Column`, and `create_all` are doing.
- Run the backend locally, hit `/auth/register` and `/auth/login` with
  curl or Postman. Watch a row appear in `math_notes.db` (any SQLite
  viewer, or `sqlite3 math_notes.db "select * from users;"`).

**Day 2 — The Gemini call + variable store**
- Read `backend/utils.py`. Understand the prompt, and why the response is
  parsed defensively (models don't always return clean JSON).
- Read `backend/session_store.py` and trace through `main.py`'s
  `/calculate`: where does `session["vars"]` get read, where does it get
  updated, why only `if session is not None`.
- Try breaking it on purpose: send a bad token, send no token, see what
  falls back to what.

**Day 3 — Frontend**
- Read `frontend/src/screens/home/index.tsx`. Understand the canvas
  drawing loop (`startDrawing` / `draw` / `stopDrawing`), and how strokes
  get bounded (`strokeBounds`) so the answer renders near your writing.
- Read `frontend/src/screens/auth/index.tsx` and `App.tsx`. Understand how
  the token flows: login → localStorage → passed into `HomeScreen` → sent
  with every `/calculate` request.
- Make one small change yourself (e.g. add a new swatch color, or change
  where the result box renders) to confirm you understand the data flow.

**Day 4 — Deploy + be ready to explain it**
- Deploy following the steps above.
- Practice a 60-second explanation of: the request lifecycle (draw → PNG →
  base64 → FastAPI → Gemini → parsed JSON → rendered on canvas), why
  passwords are hashed not stored plain, and the one clearly-stated
  limitation of the in-memory session store (resets on restart, doesn't
  scale past one server process) — interviewers like a candidate who knows
  their own project's limits.

## Known limitations (worth knowing, not worth hiding)

- Sessions/variables are an in-memory dict — fine for a portfolio demo,
  not production-grade (would move to Redis or a DB table for that).
- No password-reset flow, no email verification — out of scope for a
  learning project.
- `google-generativeai` (the SDK this uses) is deprecated in favor of
  `google-genai`; it still works today but is worth migrating eventually.
