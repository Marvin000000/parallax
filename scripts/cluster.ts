import { PrismaClient } from '@prisma/client';
const { Matrix, SVD } = require('ml-matrix');
const { kmeans } = require('ml-kmeans');

const prisma = new PrismaClient();

// Configuration
const MIN_VOTES_GLOBAL = 3;
const MIN_VOTES_TOPIC = 2;
const TOPICS = ['Tech', 'Startup', 'Policy', 'Science', 'News'];

const MIN_NEW_VOTES = 10; // Threshold for re-clustering (low for MVP)

async function main() {
  console.log('Starting Multi-Topic Clustering...');

  // 0. Check for New Activity (Optimization)
  // Only re-cluster if we have enough new votes in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const newVotesCount = await prisma.vote.count({
    where: { createdAt: { gte: oneHourAgo } }
  });

  if (newVotesCount < MIN_NEW_VOTES) {
    console.log(`Only ${newVotesCount} new votes in the last hour. Skipping clustering.`);
    return;
  }
  
  console.log(`Found ${newVotesCount} new votes. Proceeding with clustering.`);

  // 1. Fetch Users + Votes (with Tags)
  const users = await prisma.user.findMany({
    include: { 
      votes: {
        include: {
          post: {
            include: { tags: { include: { tag: true } } }
          }
        }
      }
    }
  });

  // --- PHASE 1: GLOBAL CLUSTERING ---
  console.log('--- GLOBAL PHASE ---');
  await runClustering(users, 'global', MIN_VOTES_GLOBAL);

  // --- PHASE 2: TOPIC CLUSTERING ---
  for (const topic of TOPICS) {
    console.log(`--- TOPIC: ${topic} ---`);
    // Filter votes to only include this topic
    const topicUsers = users.map(u => ({
      ...u,
      votes: u.votes.filter(v => v.post?.tags.some(t => t.tag.name === topic))
    })).filter(u => u.votes.length >= MIN_VOTES_TOPIC);

    if (topicUsers.length < 5) {
      console.log(`Not enough users for topic ${topic} (${topicUsers.length} < 5). Skipping.`);
      continue;
    }

    await runClustering(topicUsers, topic, MIN_VOTES_TOPIC);
  }
  
  console.log('Clustering Complete.');
}

async function runClustering(users: any[], scope: string, minVotes: number) {
  const activeUsers = users.filter(u => u.votes.length >= minVotes);
  
  if (activeUsers.length < 5) {
    console.log(`[${scope}] Not enough active users. Skipping.`);
    return;
  }

  // Identify Unique Post IDs (Columns) for this scope
  const postIds = new Set<string>();
  activeUsers.forEach(u => u.votes.forEach((v: any) => {
    if (v.postId) postIds.add(v.postId);
  }));
  const postArray = Array.from(postIds);
  const postIndexMap = new Map(postArray.map((id, i) => [id, i]));
  
  const m = activeUsers.length; // Rows
  const n = postArray.length;   // Columns
  
  console.log(`[${scope}] Matrix: ${m} Users x ${n} Posts`);

  // Build Matrix
  const matrix = Matrix.zeros(m, n);
  for (let i = 0; i < m; i++) {
    const user = activeUsers[i];
    for (const vote of user.votes) {
      if (vote.postId && postIndexMap.has(vote.postId)) {
        matrix.set(i, postIndexMap.get(vote.postId)!, vote.value);
      }
    }
  }

  // SVD
  const svd = new SVD(matrix, { computeLeftSingularVectors: true, computeRightSingularVectors: false, autoTranspose: true });
  const U = svd.leftSingularVectors;
  const latentFeatures = U.to2DArray().map((row: number[]) => row.slice(0, 3)); // Top 3 dims

  // K-Means
  const k = Math.min(3, m - 1); // Cannot have more clusters than users
  const result = kmeans(latentFeatures, k, { initialization: 'kmeans++' });

  // Save Results
  for (let i = 0; i < m; i++) {
    const user = activeUsers[i];
    const clusterId = result.clusters[i] + 1;

    if (scope === 'global') {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          clusterId,
          clusterLabel: `Global Tribe ${clusterId}`
        }
      });
    } else {
      // Update JSON field safely
      // We need to fetch current JSON first to merge, but Prisma update doesn't support deep merge on JSON easily in one query without raw SQL or careful handling.
      // For simplicity, we fetch fresh user or just rely on the object in memory (which might be stale but okay for batch script).
      // Actually, we should use update with set.
      
      const currentUser = await prisma.user.findUnique({ where: { id: user.id }, select: { topicClusters: true } });
      const currentClusters = (currentUser?.topicClusters as any) || {};
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          topicClusters: {
            ...currentClusters,
            [scope]: clusterId
          }
        }
      });
    }
  }
  console.log(`[${scope}] Updated ${m} users.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
