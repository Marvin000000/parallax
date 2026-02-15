# Parallax: The Bubble-Aware Social Network

## 1. Concept & Philosophy
**Problem:** Modern social media algorithms hide polarization. They feed users content that confirms their bias, creating invisible "Echo Chambers."
**Solution:** A platform where user clustering is explicit.
*   **The Mechanism:** Users are grouped into "Clusters" (Tribes) based on voting patterns.
*   **The View:** When viewing a thread, you see:
    *   *Top Comment (Global)*
    *   *Top Comment (Your Cluster)*
    *   *Top Comment (Opposing Cluster)*
*   **Goal:** To gamify "perspective taking" and allow users to see what the "other side" is actually saying, not what a strawman says.

## 2. Tech Stack: The "T3" Standard
*   **Language:** TypeScript (Strict Mode).
*   **Framework:** Next.js 14+ (App Router).
*   **Database:** PostgreSQL with `pgvector` extension (Supabase or Neon recommended for managed hosting).
*   **ORM:** Prisma.
*   **Auth:** NextAuth.js (Google/GitHub/Email magic links).
*   **Styling:** Tailwind CSS (Fast, consistent).

## 3. Development Roadmap

### Phase 1: The MVP (Months 1-2)
*   **Core Loop:** User can post a link/text, comment, and upvote/downvote.
*   **The "Naive" Algorithm:**
    *   No complex ML yet.
    *   Hardcode 3 "Factions" (e.g., A, B, C) for testing.
    *   Assign users randomly or by self-selection to test the UI of "seeing other perspectives."

### Phase 2: The Vector Engine (Months 3-4)
*   Implement `pgvector`.
*   **Voting Vectorization:** Every upvote modifies the user's hidden embedding vector.
*   **Cluster Job:** A nightly cron job runs K-Means clustering on user vectors to assign "Cluster IDs."
*   **UI Update:** The comment section now dynamically splits based on these IDs.

### Phase 3: The "Bridge" Features (Months 5-6)
*   **"Bridge Comments":** Highlight comments that have high upvotes from *both* distant clusters. These are the gold standard of discourse.
*   **Reputation System:** Users gain "Bridge Cred" for writing comments that appeal across divides.

## 4. Deployment Strategy
*   **Infrastructure:** Vercel (Frontend) + Supabase (Backend/DB).
    *   *Why:* Zero config, infinite scalability until you hit massive scale.
*   **Cost Control:** Text is cheap. Images/Video are expensive.
    *   *MVP Rule:* No image hosting. Users post links to Imgur/YouTube. We only store text.

## 5. Monetization (Sales)
*   **Ad Model (Contextual):**
    *   Advertisers can target specific "Clusters." (e.g., Sell survival gear to the "Prepper" cluster, sell tech to the "Dev" cluster).
    *   *Differentiation:* We sell "Perspective." "See how the other side thinks" is a premium insight for brands.
*   **Premium Subscription (Parallax+):**
    *   Custom Cluster Analysis: "Show me how Cluster X reacted to this."
    *   Ad-free.
    *   Verification badge (stops bot clusters).

## 6. Marketing Strategy (The "Anti-Reddit")

### The Pitch
"Reddit is broken. Twitter is a warzone. Parallax is a map of the battlefield."

### Tactics
*   **The "Hacker News" Launch:** Launch with a focus on high-intellect, tech-focused discussions first. This sets the tone (quality > quantity).
*   **Visualizations:** Create viral infographics showing "The Map of the Internet." Show how different clusters voted on a hot topic (e.g., "AI Regulation").
    *   *Caption:* "Stop guessing what they think. Look at the data."
*   **Influencer targeting:** Target "Centrist" or "Rationalist" podcasters (Lex Fridman types) who are obsessed with "nuance" and "bridging the divide."

## 7. Risks
*   **The "4chan" Problem:** Unmoderated clusters can become hate speech cesspools.
    *   *Mitigation:* Global content policy (Must be legal). Clusters can exist, but if a Cluster consistently upvotes illegal content, the *entire cluster* gets "shadowbanned" or dissolved.
