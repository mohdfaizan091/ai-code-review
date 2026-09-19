import { jsonrepair } from "jsonrepair";

export function extractAndParseJSON(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}') + 1;
  if (start === -1 || end === 0) throw new Error('No JSON object found');
  let candidate = text.substring(start, end);
  candidate = candidate.replace(/```json|```/g, '').trim();
  try {
    const repaired = jsonrepair(candidate);
    return JSON.parse(repaired);
  } catch {
    return JSON.parse(candidate);
  }
}