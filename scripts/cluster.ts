import { PrismaClient } from '@prisma/client';
import { Matrix, SVD } from 'ml-matrix';
import { kmeans } from 'ml-kmeans';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting User Clustering (Collaborative Filtering V1)...');

  // 1. Fetch Users + Votes
  const users = await prisma.user.findMany({
    include: { votes: true }
  });

  // Filter out inactive users (Need > 3 votes to cluster meaningfully)
  const activeUsers = users.filter(u => u.votes.length >= 3);
  console.log(`Found ${activeUsers.length} active users.`);
  
  if (activeUsers.length < 5) {
    console.log('Not enough active users for clustering (Need > 5). Aborting.');
    return;
  }

  // 2. Identify Unique Post IDs (Columns)
  const postIds = new Set<string>();
  activeUsers.forEach(u => u.votes.forEach(v => {
    if (v.postId) postIds.add(v.postId);
  }));
  const postArray = Array.from(postIds);
  const postIndexMap = new Map(postArray.map((id, i) => [id, i]));
  
  const m = activeUsers.length; // Rows
  const n = postArray.length;   // Columns (Posts)
  
  console.log(`Building Matrix: ${m} Users x ${n} Posts`);

  // 3. Build Sparse Matrix
  const matrix = Matrix.zeros(m, n);
  
  for (let i = 0; i < m; i++) {
    const user = activeUsers[i];
    for (const vote of user.votes) {
      if (vote.postId && postIndexMap.has(vote.postId)) {
        const j = postIndexMap.get(vote.postId)!;
        matrix.set(i, j, vote.value); // +1 or -1
      }
    }
  }

  // 4. Dimensionality Reduction (SVD)
  // We want to reduce N posts -> 3 latent dimensions (Tribes)
  // U * S * V^T
  // U contains the user coordinates in the latent space.
  
  console.log('Running SVD...');
  // Note: Full SVD is expensive for large N, use Randomized SVD or ALS in production
  const svd = new SVD(matrix, { computeLeftSingularVectors: true, computeRightSingularVectors: false, autoTranspose: true });
  
  // Get the top 3 components for each user
  // U is (m x m), we want (m x 3)
  const U = svd.leftSingularVectors;
  const latentFeatures = U.to2DArray().map(row => row.slice(0, 3)); // Keep top 3 dimensions
  
  console.log('Latent User Vectors (First 3):', latentFeatures.slice(0, 3));

  // 5. K-Means Clustering on Latent Space
  console.log('Running K-Means (K=3)...');
  const result = kmeans(latentFeatures, 3, { initialization: 'kmeans++' });
  
  // 6. Assign Clusters
  for (let i = 0; i < m; i++) {
    const user = activeUsers[i];
    const clusterId = result.clusters[i] + 1; // 1-based index
    
    // Label Logic: Since clusters are abstract now (Latent Factor 1, 2, 3), we can't easily name them "Tech" or "Policy".
    // We name them generically for now: "Tribe A", "Tribe B", "Tribe C"
    // Later: Analyze the top posts in each cluster to auto-generate labels.
    const label = `Tribe ${String.fromCharCode(64 + clusterId)}`; 

    await prisma.user.update({
      where: { id: user.id },
      data: {
        clusterId: clusterId,
        clusterLabel: label
      }
    });
    
    console.log(`User ${user.id.substring(0,5)} -> Cluster ${clusterId} (${label})`);
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
