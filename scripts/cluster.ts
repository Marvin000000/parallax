import { PrismaClient } from '@prisma/client';
import { kmeans } from 'ml-kmeans';

const prisma = new PrismaClient();

// The Core Dimensions of our Political Compass
// Index 0: Tech/Innovation/Future
// Index 1: Policy/Regulation/Society
// Index 2: Business/Finance/Markets
const TAG_VECTORS: Record<string, [number, number, number]> = {
  'Tech': [1.0, 0.2, 0.2],
  'Startup': [0.8, 0.0, 0.9],
  'Policy': [0.2, 1.0, 0.1],
  'BigTech': [0.9, 0.6, 0.8],
  'News': [0.1, 0.8, 0.1],
  'Global': [0.1, 0.9, 0.3],
  'Science': [0.9, 0.3, 0.0],
  // Fallback for unknown tags
  'Unknown': [0.1, 0.1, 0.1],
};

async function main() {
  console.log('Starting User Clustering (V1)...');

  // 1. Fetch all users and their votes
  const users = await prisma.user.findMany({
    include: {
      votes: {
        where: { value: 1 }, // Only upvotes matter for interest
        include: {
          post: {
            include: { tags: { include: { tag: true } } }
          }
        }
      }
    }
  });

  const activeUsers = users.filter(u => u.votes.length > 0);
  console.log(`Found ${activeUsers.length} active users to cluster.`);

  if (activeUsers.length < 3) {
    console.log('Not enough active users for K-Means (Need > 3). Aborting.');
    return;
  }

  // 2. Build User Vectors
  const userVectors: number[][] = [];
  const userIds: string[] = [];

  for (const user of activeUsers) {
    let techScore = 0;
    let policyScore = 0;
    let bizScore = 0;
    let totalTags = 0;

    for (const vote of user.votes) {
      if (!vote.post) continue;
      for (const t of vote.post.tags) {
        const vec = TAG_VECTORS[t.tag.name] || TAG_VECTORS['Unknown'];
        techScore += vec[0];
        policyScore += vec[1];
        bizScore += vec[2];
        totalTags++;
      }
    }

    if (totalTags > 0) {
      // Normalize
      userVectors.push([
        techScore / totalTags,
        policyScore / totalTags,
        bizScore / totalTags
      ]);
      userIds.push(user.id);
    }
  }

  // 3. Run K-Means
  // K=3 for MVP (Tech vs Policy vs Biz/Other)
  const result = kmeans(userVectors, 3, { initialization: 'kmeans++' });

  // 4. Assign Clusters
  for (let i = 0; i < userIds.length; i++) {
    const userId = userIds[i];
    const clusterId = result.clusters[i] + 1; // 1-based index (0 reserved for New)
    
    // Determine Label based on Centroid
    const centroid = result.centroids[result.clusters[i]];
    let label = 'Generalist';
    
    // Which axis dominates?
    const maxVal = Math.max(...centroid);
    if (maxVal === centroid[0]) label = 'Technologist';
    else if (maxVal === centroid[1]) label = 'Policy Wonk';
    else if (maxVal === centroid[2]) label = 'Market Watcher';

    // Update User
    await prisma.user.update({
      where: { id: userId },
      data: {
        clusterId: clusterId,
        clusterLabel: label
      }
    });
    
    console.log(`User ${userId.substring(0,5)} -> Cluster ${clusterId} (${label})`);
  }
  
  console.log('Clustering Complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
