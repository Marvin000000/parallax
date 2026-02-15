import { PrismaClient } from '@prisma/client';
import Parser from 'rss-parser';
import axios from 'axios';

const prisma = new PrismaClient();
const parser = new Parser();

// Types for Source Configuration
type Source = {
  name: string;
  type: 'rss' | 'hn' | 'reddit';
  url: string;
  tags?: string[];
};

const SOURCES: Source[] = [
  { name: 'Hacker News', type: 'hn', url: 'https://hacker-news.firebaseio.com/v0/topstories.json', tags: ['Tech', 'Startup'] },
  { name: 'r/Technology', type: 'reddit', url: 'https://www.reddit.com/r/technology/top.json?limit=10', tags: ['Tech', 'Policy'] },
  { name: 'NYT Technology', type: 'rss', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', tags: ['News', 'BigTech'] },
  { name: 'BBC World', type: 'rss', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', tags: ['News', 'Global'] },
];

async function main() {
  console.log('Starting Mirror Bot...');
  
  // Ensure Tags Exist
  const allTags = new Set(SOURCES.flatMap(s => s.tags || []));
  for (const tagName of allTags) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    });
  }
  
  // Create a dedicated "Mirror Bot" user if not exists
  let botUser = await prisma.user.findFirst({ where: { email: 'mirror@parallax.com' } });
  if (!botUser) {
    botUser = await prisma.user.create({
      data: {
        name: 'Parallax Mirror',
        email: 'mirror@parallax.com',
        clusterLabel: 'Observer',
        clusterId: 0,
      }
    });
    console.log('Created Mirror Bot User');
  }

  const existingUrls = new Set((await prisma.post.findMany({ select: { url: true } })).map(p => p.url));
  let newPostsCount = 0;

  for (const source of SOURCES) {
    try {
      console.log(`Fetching from ${source.name}...`);
      const items = await fetchItems(source);
      
      for (const item of items) {
        if (!item.url || existingUrls.has(item.url)) continue;
        
        await prisma.post.create({
          data: {
            title: item.title,
            url: item.url,
            content: `Source: ${source.name}`,
            published: true,
            authorId: botUser.id,
            authorClusterId: 0, // Neutral
            tags: {
              create: (source.tags || []).map(tagName => ({
                tag: { connect: { name: tagName } },
                assignedBy: 'system'
              }))
            }
          }
        });
        
        existingUrls.add(item.url);
        newPostsCount++;
        console.log(`+ Added: ${item.title.substring(0, 50)}...`);
      }
    } catch (e) {
      console.error(`Failed to fetch ${source.name}:`, e);
    }
  }

  console.log(`Mirror complete. Added ${newPostsCount} new posts.`);
}

async function fetchItems(source: Source): Promise<{ title: string; url: string }[]> {
  const results: { title: string; url: string }[] = [];

  if (source.type === 'hn') {
    // HN: Get top 20 IDs -> fetch details
    const { data: ids } = await axios.get(source.url);
    const topIds = ids.slice(0, 15); // Top 15 only
    
    for (const id of topIds) {
      const { data: story } = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      if (story && story.url && story.type === 'story') {
        results.push({ title: story.title, url: story.url });
      }
    }
  } 
  else if (source.type === 'reddit') {
    // Reddit JSON API
    const { data } = await axios.get(source.url, { headers: { 'User-Agent': 'ParallaxMirror/1.0' } });
    if (data && data.data && data.data.children) {
      for (const child of data.data.children) {
        const post = child.data;
        if (!post.stickied && post.url) {
          results.push({ title: post.title, url: post.url });
        }
      }
    }
  } 
  else if (source.type === 'rss') {
    // RSS Feed
    const feed = await parser.parseURL(source.url);
    for (const item of feed.items.slice(0, 10)) {
      if (item.title && item.link) {
        results.push({ title: item.title, url: item.link });
      }
    }
  }

  return results;
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
