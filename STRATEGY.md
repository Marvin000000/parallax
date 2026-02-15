# Parallax: Operational Master Plan

## 1. DevOps & Infrastructure (The Automated Pipeline)
**Goal:** Commit code -> Automated Tests -> Deploy to Staging -> Approval -> Deploy to Prod. Zero downtime.

### The Stack
*   **Code:** GitHub.
*   **Frontend/API:** Vercel (Next.js native support).
*   **Database:** **Neon** (Postgres).
    *   *Why Neon?* It supports **Database Branching**. When you create a git branch `feature/new-ui`, Neon automatically creates a *copy* of your production database schema (with partial data) for that branch.
    *   *Benefit:* You never break Prod testing a migration.

### The Pipeline (CI/CD)
1.  **Dev (Local):** You code on `localhost:3000` against a local Docker DB or Neon Dev branch.
2.  **Pull Request:**
    *   GitHub Action triggers: `npm run lint`, `npm run type-check`.
    *   Vercel triggers: Deploys a **Preview URL** (e.g., `parallax-git-feature-x.vercel.app`).
    *   Neon triggers: Creates a database branch for this PR.
3.  **Merge to Main:**
    *   Vercel automatically promotes the build to **Production** (`parallax.com`).
    *   Database migrations run automatically on Prod.

### Investment (Infrastructure)
*   **Phase 1 (Dev/Alpha):** $0/mo.
    *   Vercel Hobby Tier (Free).
    *   Neon Free Tier (0.5 GB storage).
    *   GitHub Free.
*   **Phase 2 (Launch):** ~$64/mo.
    *   Vercel Pro ($20/mo/seat) - Required for commercial use/teams.
    *   Neon Launch ($19/mo) - Auto-scaling compute.
    *   Postmark ($15/mo) - Transactional emails (Magic Links).
    *   Domain ($10/yr).

---

## 2. Bootstrapping Content (The "Cold Start" Solution)
**Problem:** A social network with no content is a graveyard. Users will leave in 3 seconds.

### Strategy A: The "Mirror" (Automated Seeding)
*   **Concept:** We don't wait for users to post links. We write a bot that mirrors the *Top 10* posts from Hacker News and r/Technology every morning.
*   **The Twist:** The *posts* are automated, but the *comments* are empty.
*   **Why:** It gives early users something to vote on immediately.
*   **Risk:** Can feel like a "ghost town."
*   **Mitigation:** You and 5 friends commit to commenting on these 10 seeds every day for 2 weeks.

### Strategy B: The "Invite-Only" Cult (Recommended)
*   **Concept:** Limit access to 100 people.
*   **Tactics:**
    *   Hand-pick 50 "Tech Optimists" and 50 "Skeptics" (e.g., from Twitter/X).
    *   Give them a "Founding Member" badge.
    *   Tell them: "This is a closed beta to fix online discourse. We need your brain."
*   **Why:** Scarcity drives engagement. Small groups talk more than empty large rooms.

## 3. Sales & Marketing (Go-To-Market)

### The "Wedge" Audience
Don't try to be "Facebook for everyone." Be **"Reddit for Smart People who are tired of Reddit."**
*   **Target:** Tech workers, rationalists, policy wonks.
*   **Where they live:** Hacker News, Substack, "Rationalist" Twitter, LessWrong.

### Marketing Channels
1.  **The "Data Porn" Campaign:**
    *   Create beautiful visualizations of the Clusters.
    *   Example: "Here is how the 'Crypto' cluster vs the 'TradFi' cluster reacted to the Bitcoin ETF approval."
    *   Post these charts on X/Twitter. *The data is the marketing.*
2.  **Influencer Bounties:**
    *   Don't pay for "shoutouts." Pay for *usage*.
    *   Find a Substack writer with 10k subs. Ask them to host their post's comment section on Parallax for a week.

### Revenue Model (Day 1 vs Year 1)
*   **Day 1:** **Donation / Patronage.**
    *   "Buy a server hour." Users love supporting "Indie Web" projects that fight the algorithm.
*   **Year 1:** **B2B Intelligence.**
    *   Sell the *Cluster Data* to brands.
    *   "Nike wants to know: Why does the 'Eco-Conscious' cluster hate our new ad, but the 'Sneakerhead' cluster loves it?"
    *   This is high-margin, ethical (aggregated data), and keeps the site ad-free for users.

## 4. Financial Roadmap (Year 1)

### Fixed Costs (The "Keep the Lights On" Budget)
*   Hosting/DB: $1,000/yr.
*   Legal (LLC/Terms): $500 (One-time).
*   **Total:** ~$1,500/yr.

### Growth Budget (The "Fuel")
*   **Content Seeding:** $0 (Sweat equity) or $2,000 (Hire a freelance writer to curate/seed daily for 3 months).
*   **Ads/Sponsorships:** $5,000 (Testing specific niche newsletters).

### Total "Seed Round" Needed: ~$5,000 - $10,000.
*   *Can be bootstrapped personally if you skip paid ads and rely on viral "Data Porn" marketing.*

## 5. Execution Checklist (Next 30 Days)
1.  [ ] **DevOps:** Connect GitHub -> Vercel -> Neon. (1 Day)
2.  [ ] **MVP Code:** Finish Auth + Voting + Basic Clustering. (2 Weeks)
3.  [ ] **The Seed:** Write the script to fetch daily headlines from HN. (2 Days)
4.  [ ] **The Alpha:** Onboard 50 trusted users. (1 Week)
