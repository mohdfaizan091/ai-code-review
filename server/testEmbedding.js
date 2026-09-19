import { getEmbedding, cosineSimilarity } from './src/services/embeddingService.js';
import dotenv from 'dotenv';
dotenv.config();

const vec1 = await getEmbedding("function to calculate total price by multiplying");
const vec2 = await getEmbedding("compute order amount using cost times units");
const vec3 = await getEmbedding("connect to a redis cache server");

console.log("Similar meaning (should be high, ~0.6-0.9):", cosineSimilarity(vec1, vec2));
console.log("Unrelated meaning (should be low, ~0.0-0.3):", cosineSimilarity(vec1, vec3));