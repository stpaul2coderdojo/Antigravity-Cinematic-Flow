# 🚀 Deploying to Render Guide

This guide details how to host **Antigravity Cinematic Flow Studio** on [Render](https://render.com) using either the **Render Blueprint (Recommended)**, **Manual Web Service**, or **Docker Container**.

---

## ⚡ Quick Option 1: Render Blueprint (Infrastructure as Code) - Recommended

Render Blueprints let you configure and spin up everything declared in `render.yaml` with one click.

1. **Push your code to GitHub / GitLab**.
2. Go to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** in the top navigation and select **Blueprint**.
4. Connect your repository.
5. Render detects the `render.yaml` automatically:
   - **Service Name**: `antigravity-cinematic-studio`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
6. When prompted for environment variables:
   - Set `GEMINI_API_KEY`: Paste your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
7. Click **Apply**.
8. Render will build the Vite frontend, compile the production Express server into `dist/server.cjs`, and launch your service with zero downtime!

---

## 🛠️ Quick Option 2: Manual Web Service Setup

If you prefer setting up the web service manually through the Render Dashboard:

1. In the [Render Dashboard](https://dashboard.render.com), click **New +** and select **Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Name**: `antigravity-cinematic-studio` (or your preferred name)
   - **Region**: Choose the region closest to you (e.g., `Oregon (US West)` or `Frankfurt (EU Central)`)
   - **Branch**: `main` (or your active branch)
   - **Root Directory**: Leave blank (root `/`)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or higher)
4. Under **Advanced**:
   - **Health Check Path**: `/api/health`
   - **Auto-Deploy**: `Yes`
5. Under **Environment Variables**, add:
   | Key | Value | Description |
   |-----|-------|-------------|
   | `NODE_ENV` | `production` | Enables production static bundle serving |
   | `GEMINI_API_KEY` | `your_actual_gemini_api_key` | Obtained from Google AI Studio |
6. Click **Create Web Service**.

---

## 🐳 Quick Option 3: Docker Deployment on Render

If you prefer containerized hosting:

1. In the [Render Dashboard](https://dashboard.render.com), click **New +** -> **Web Service**.
2. Select your repository.
3. For **Runtime**, select **Docker**.
4. Render will automatically detect the multi-stage `Dockerfile` in the root.
5. Add the `GEMINI_API_KEY` environment variable in the dashboard.
6. Click **Create Web Service**.

---

## ⚙️ How Production Hosting Works

- **Dynamic Port Binding**: Render automatically assigns an ephemeral port via `process.env.PORT`. The backend binds to `0.0.0.0` on `process.env.PORT || 3000`.
- **Single-Port Full-Stack**: In production mode (`NODE_ENV=production`), Express directly serves the pre-compiled Vite static frontend from `/dist`, while handling all API requests (`/api/*`) on the exact same port. No separate Nginx proxy is required.
- **Built-in Resilience**: If `GEMINI_API_KEY` has quota constraints or is temporarily unreachable, the studio gracefully falls back to local procedural script generation and vector keyframe generation without crashing.
- **Health Verification**: `/api/health` returns `{ "status": "ok", "service": "Antigravity Cinematic Flow Studio" }` for Render's automated health checks.

---

## 🌐 Verifying Your Deployment

Once Render finishes the build:
1. Click the provided URL (e.g. `https://antigravity-cinematic-studio.onrender.com`).
2. Test generating a new script with **"Generate 3-Act Cinematic Film"** or take the **Google Veo Interactive Walkthrough for Judges**.
3. Verify `/api/health` in your browser to confirm operational health.
