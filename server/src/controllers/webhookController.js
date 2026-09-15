import crypto from 'crypto';
import { getPRFiles } from '../services/githubService.js';

function verifySignature(req) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;

  const expected = 'sha256=' + crypto
    .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export const handleGithubWebhook = async (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.headers['x-github-event'];
  const { action, pull_request, repository } = req.body;

  // Turant 200 bhejo — GitHub ko wait mat karwao heavy processing ke liye
  res.status(200).send('OK');

  if (event === 'pull_request' && ['opened', 'synchronize'].includes(action)) {
    try {
      const files = await getPRFiles(
        repository.owner.login,
        repository.name,
        pull_request.number
      );
      console.log('Changed files:', files.map(f => ({ filename: f.filename, patch: f.patch?.slice(0, 100) })));
      // Checkpoint 3 mein yaha Groq ko bhejenge
    } catch (err) {
      console.error('Failed to fetch PR files:', err.message);
    }
  }
};