# Deployment Guide: Going Live

Follow these steps to deploy Parallax to Production (Vercel + Neon).

## 1. Database Setup (Neon)
1.  Go to [Neon.tech](https://neon.tech) and create a project (`parallax-prod`).
2.  Copy the **Connection String** (`postgres://...`).
3.  **Run Migrations:**
    *   Locally, update your `.env` to point to the *production* connection string temporarily.
    *   Run: `npx prisma migrate deploy`
    *   *Tip:* Or let Vercel handle it (see step 3).

## 2. Authentication Setup (Google)
1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a Project (`Parallax`).
3.  Go to **APIs & Services > Credentials**.
4.  **Create Credentials > OAuth Client ID**.
    *   **Application Type:** Web Application.
    *   **Authorized Origins:** `https://your-project.vercel.app` (You'll get this URL in Step 3).
    *   **Authorized Redirect URIs:** `https://your-project.vercel.app/api/auth/callback/google`.
5.  Copy the **Client ID** and **Client Secret**.

## 3. Vercel Deployment
1.  Go to [Vercel](https://vercel.com) -> **Add New > Project**.
2.  Select `richardcruceanu/parallax`.
3.  **Environment Variables** (Copy these in):
    ```bash
    # Database (From Neon)
    DATABASE_URL="postgres://..."
    
    # Auth (Generate a random string: openssl rand -base64 32)
    NEXTAUTH_SECRET="random-string-here"
    NEXTAUTH_URL="https://your-project.vercel.app" # Update after deploy
    
    # Google Auth (From Step 2)
    GOOGLE_CLIENT_ID="..."
    GOOGLE_CLIENT_SECRET="..."
    
    # Email (Gmail App Password)
    EMAIL_SERVER_HOST="smtp.gmail.com"
    EMAIL_SERVER_PORT="587"
    EMAIL_SERVER_USER="marvincruceanu@gmail.com"
    EMAIL_SERVER_PASSWORD="jeyf ytvr ugbf ntej"
    EMAIL_FROM="marvincruceanu@gmail.com"
    ```
4.  Click **Deploy**.

## 4. Post-Deploy Checks
1.  **Visit the URL.**
2.  **Sign In:** Test Google Login. If it fails, check the "Authorized Redirect URIs" in Google Console match your Vercel URL exactly.
3.  **Test Scraper:**
    *   Go to GitHub Repo -> **Actions**.
    *   Select "Daily Content Mirror".
    *   Click **Run workflow**.
    *   Check the logs to see if it populated your Prod DB.

## 5. Automation (Cron)
*   The Scraper & Clustering scripts run automatically via GitHub Actions.
*   **Important:** You must add `DATABASE_URL` to your **GitHub Repository Secrets** (`Settings > Secrets > Actions`) so the bot can write to the Prod DB.

---
**You are live.** 🚀
