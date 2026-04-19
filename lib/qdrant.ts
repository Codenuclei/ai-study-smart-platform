import { QdrantClient } from '@qdrant/js-client-rest';
import { google } from '@ai-sdk/google';
import { embed } from 'ai';

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION_NAME = 'study_materials';

export async function ensureCollection() {
  const collections = await client.getCollections();
  const exists = collections.collections.some(c => c.name === COLLECTION_NAME);
  
  if (!exists) {
    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 768, // size for google text-embedding-004
        distance: 'Cosine',
      },
    });
  }
}

export async function upsertMaterial(materialId: string, title: string, content: string, userId: string) {
  await ensureCollection();

  // Simple chunking: split by double newlines (paragraphs)
  const chunks = content.split(/\n\s*\n/).filter(c => c.trim().length > 10);
  
  // If no chunks found, just use the whole text
  if (chunks.length === 0) chunks.push(content);

  const points = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    // Generate embedding
    const { embedding } = await embed({
      model: google.textEmbeddingModel('text-embedding-004'),
      value: chunk,
    });

    points.push({
      id: `${materialId}-${i}`,
      vector: embedding,
      payload: {
        materialId,
        userId,
        title,
        text: chunk,
        chunkIndex: i,
        createdAt: new Date().toISOString(),
      },
    });
  }

  await client.upsert(COLLECTION_NAME, {
    wait: true,
    points,
  });
}

export async function searchMaterials(query: string, userId: string, limit = 5) {
  const { embedding } = await embed({
    model: google.textEmbeddingModel('text-embedding-004'),
    value: query,
  });

  const results = await client.search(COLLECTION_NAME, {
    vector: embedding,
    filter: {
      must: [
        {
          key: 'userId',
          match: {
            value: userId,
          },
        },
      ],
    },
    limit,
  });

  return results.map(r => r.payload);
}
