# 🌐 LEXORA AI - Environment Variables & Production Deployment Setup Guide

This document specifies all environment variables required for running and deploying LEXORA AI across local development and production environments (Vercel, Render, Railway, AWS).

---

## 1. Environment Variable Summary

| Variable Name | Component | Scope | Local Dev Default | Description | Required in Prod? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Frontend | Client | `http://localhost:5000/api` | Base HTTP endpoint for Node.js Express API. | **YES** |
| `VITE_FASTAPI_BASE_URL` | Frontend | Client | `http://localhost:8000` | Base HTTP endpoint for Python FastAPI AI microservice. | **YES** |
| `PORT` | Node / Python | Server | `5000` / `8000` | Listening HTTP port for backend servers. | NO (Assigned by cloud host) |
| `JWT_SECRET` | Node Server | Server | *Must be set* | Secret key for signing and verifying JWT tokens. | **YES (CRITICAL)** |
| `DATABASE_URL` | Node Server | Server | `"file:./dev.db"` | Prisma connection string (PostgreSQL/SQLite). | **YES** |
| `CLIENT_URL` | Node Server | Server | `http://localhost:5173` | Allowed CORS origin for frontend client. | **YES** |
| `FASTAPI_BASE_URL` | Node Server | Server | `http://localhost:8000` | Internal server-to-server endpoint for Python AI service. | **YES** |
| `OPENAI_API_KEY` | Python Server | Server | *(Optional)* | OpenAI API Key for GPT-4o-mini generation. | Optional |
| `GEMINI_API_KEY` | Python Server | Server | *(Optional)* | Gemini API Key for Gemini 1.5 Flash generation. | Optional |

---

## 2. Setting Up Local Development (.env Files)

### Frontend (`.env`)
Create a `.env` file at project root:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FASTAPI_BASE_URL=http://localhost:8000
```

### Node.js Express Backend (`server/.env`)
Create a `server/.env` file:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=lexora_judicial_intelligence_secret_key_2026_supreme
DATABASE_URL="file:./dev.db"
CLIENT_URL=http://localhost:5173
FASTAPI_BASE_URL=http://localhost:8000
```

### Python FastAPI Backend (`backend/api/.env`)
Create a `backend/api/.env` file:
```env
PORT=8000
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIzaSy...
```

---

## 3. Production Deployment Guidelines (Vercel / Cloud Hosts)

1. **Frontend (Vercel)**:
   - Configure Environment Variables in Vercel Project Settings:
     - `VITE_API_BASE_URL = https://your-node-backend.onrender.com/api`
     - `VITE_FASTAPI_BASE_URL = https://your-fastapi-backend.onrender.com`

2. **Backend Security**:
   - Never commit `.env` files to git repositories.
   - Always define a unique, high-entropy `JWT_SECRET` in production hosting environments.
