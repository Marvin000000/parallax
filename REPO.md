# GitHub Repository Setup

## 1. Create Repository
1.  Go to GitHub.com -> New Repository.
2.  Name: `parallax`.
3.  Public or Private (Private recommended for now).

## 2. Configure Vercel (Deployment)
1.  Sign up at [vercel.com](https://vercel.com).
2.  Import Project -> "Continue with GitHub" -> Select `parallax`.
3.  **Environment Variables:**
    *   `DATABASE_URL` (From Neon).
    *   `NEXTAUTH_SECRET` (Run `openssl rand -base64 32`).
    *   `NEXTAUTH_URL` (e.g. `https://parallax.vercel.app`).

## 3. Configure GitHub Secrets (CI/CD)
Go to `Settings > Secrets and variables > Actions` and add:

| Secret Name | Value Source | Description |
| :--- | :--- | :--- |
| `VERCEL_TOKEN` | [Vercel Account Settings -> Tokens](https://vercel.com/account/tokens) | API Key for deployment. |
| `VERCEL_ORG_ID` | Vercel Project Settings (General -> Project ID) | Your team ID. |
| `VERCEL_PROJECT_ID` | Vercel Project Settings (General -> Project ID) | Your project ID. |
| `DATABASE_URL` | Neon Dashboard | `postgres://...` |
| `SHADOW_DATABASE_URL` | Neon Dashboard (Create a second DB) | Optional: Used for `prisma migrate dev` safe checks. |

## 4. Push Code
```bash
git init
git add .
git commit -m "feat: Initial commit with CI pipeline"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/parallax.git
git push -u origin main
```
