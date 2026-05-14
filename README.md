# Chef Qwen 🍳

An AI-powered recipe generator that creates personalized recipes from your ingredients. Built with **Next.js** and **FastAPI**, powered by **Qwen AI**.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React 19, Vanilla CSS |
| Backend | FastAPI, Python 3.11+ |
| Database | PostgreSQL (async SQLAlchemy + asyncpg) |
| Auth | JWT (email/password) + Google OAuth 2.0 |
| AI | Qwen2.5-7B via HuggingFace Inference API |

## Project Structure

```
Chef-Mistral/
├── frontend/           # Next.js app (port 3000)
│   └── src/
│       ├── app/        # Pages: landing, login, register, chef
│       ├── components/ # Navbar, IngredientsList, RecipeDisplay
│       └── lib/        # API client, auth context
├── backend/            # FastAPI app (port 8000)
│   ├── main.py         # Routes & app config
│   ├── auth.py         # JWT & password utilities
│   ├── oauth.py        # Google OAuth flow
│   ├── ai.py           # HuggingFace Qwen integration
│   ├── models.py       # SQLAlchemy User model
│   └── database.py     # Async DB setup
└── README.md
```

## Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **PostgreSQL** running locally (or via Docker)

## Quick Start (Docker Compose)

The easiest way to run everything with a single command:

```bash
# 1. Configure your backend env
cp backend/.env.example backend/.env
# Edit backend/.env with your HF_ACCESS_TOKEN, JWT_SECRET_KEY, Google OAuth creds

# 2. Launch all services (PostgreSQL + Backend + Frontend)
docker compose up --build
```

This starts:
- **PostgreSQL** on port 5432
- **FastAPI backend** on [http://localhost:8000](http://localhost:8000)
- **Next.js frontend** on [http://localhost:3000](http://localhost:3000)

To stop: `docker compose down` (add `-v` to also wipe the database volume).

---

## Manual Setup

### 1. Database

```bash
# Create the PostgreSQL database
createdb chef_qwen
```

Or with Docker:
```bash
docker run -d --name chef-pg -e POSTGRES_DB=chef_qwen -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
```

### 2. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your HF_ACCESS_TOKEN, JWT_SECRET_KEY, Google OAuth creds, etc.

# Start the server
uvicorn main:app --port 8000 --reload
```

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Deployment (k3s + GitHub Actions)

This project includes fully automated production-ready manifests for deployment to a **k3s Kubernetes cluster** via **GitHub Actions** and **GitHub Container Registry (GHCR)**.

### Architecture Highlights
- **Single Subdomain Routing**: The Next.js frontend handles requests at `qchef.udhomelab.dpdns.org` and automatically proxies `/api/*` traffic server-side directly to the internal Kubernetes backend service over ClusterIP.
- **NodePort Integration**: The frontend standalone service binds to **NodePort** to seamlessly connect with local Cloudflare Tunnel configurations.
- **Zero-Touch Secrets**: Application credentials are automatically encrypted and injected natively during the pipeline rollout using GitHub Repository Secrets.

### Deployment Workflow
Deployments are fully automated on pushes to the `main` branch via `.github/workflows/deploy.yml`:
1. **Build & Push**: Compiles multi-layer optimized Docker Buildx images for backend and frontend layers and pushes them securely to `ghcr.io` under lowercase repository metadata tags.
2. **Local Rollouts**: Targets your local **self-hosted runner** agent (`runs-on: self-hosted`) to verify the target namespace, inject secrets securely, apply updated YAML manifests (`k8s/`), and trigger zero-downtime rolling rollout updates.

### Server & Repo Setup Prerequisites
1. **Self-Hosted Runner**: Register and launch a self-hosted runner service on your target server (via Repo Settings -> Actions -> Runners).
2. **GitHub Repository Secrets**: Configure the following production variables under your Actions repository secrets:
   - `HF_ACCESS_TOKEN`, `JWT_SECRET_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `POSTGRES_PASSWORD`
3. **GHCR Pull Secret**: Create a read-only registry access secret named `ghcr-secret` in your target `qchef` namespace to allow nodes to pull your compiled private/scoped images.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `HF_ACCESS_TOKEN` | HuggingFace API token |
| `JWT_SECRET_KEY` | Secret for signing JWT tokens |
| `DATABASE_URL` | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL |
| `FRONTEND_URL` | Frontend URL for CORS & redirects |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:8000`) |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login with email/password |
| GET | `/api/auth/google` | No | Google OAuth redirect |
| GET | `/api/auth/google/callback` | No | Google OAuth callback |
| GET | `/api/auth/me` | JWT | Get current user |
| POST | `/api/recipe/generate` | JWT | Generate recipe from ingredients |
| GET | `/api/health` | No | Health check |
