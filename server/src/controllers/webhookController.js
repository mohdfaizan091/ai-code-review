import crypto from 'crypto';
import { getPRFiles } from '../services/githubService.js';
import { reviewPRDiff } from '../services/prReviewService.js';

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

  res.status(200).send('OK');

  if (event === 'pull_request' && ['opened', 'synchronize'].includes(action)) {
    try {
      const files = await getPRFiles(
        repository.owner.login,
        repository.name,
        pull_request.number
      );
      const review = await reviewPRDiff(files);
      console.log('AI Review result:', JSON.stringify(review, null, 2));
      // Checkpoint 4 mein yaha GitHub pe post karenge
    } catch (err) {
      console.error('Failed to review PR:', err.message);
    }
  }
};