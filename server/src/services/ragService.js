import { getEmbedding, cosineSimilarity } from './embeddingService.js';

const SIMILARITY_THRESHOLD = 0.4; // isse kam similarity wale chunks discard honge, noise avoid karne ke liye

export async function findRelevantContext(diffText, relatedFiles) {
  if (relatedFiles.length === 0) return [];

  const diffEmbedding = await getEmbedding(diffText);

  const scoredFiles = await Promise.all(
    relatedFiles.map(async (file) => {
      const fileEmbedding = await getEmbedding(file.content);
      const score = cosineSimilarity(diffEmbedding, fileEmbedding);
      return { ...file, score };
    })
  );

  return scoredFiles
    .filter((f) => f.score >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b.score - a.score) // highest similarity pehle
    .slice(0, 2); // top 2 se zyada mat lo, prompt bahut bada ho jayega
}