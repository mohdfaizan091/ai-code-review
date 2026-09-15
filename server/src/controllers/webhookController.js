import crypto from 'crypto';

function verifySignature(req) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;

  const expected = 'sha256=' + crypto
    .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export const handleGithubWebhook = (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = req.headers['x-github-event'];
  const { action, pull_request, repository } = req.body;

  if (event === 'pull_request' && ['opened', 'synchronize'].includes(action)) {
    console.log('PR event received:', {
      owner: repository.owner.login,
      repo: repository.name,
      pull_number: pull_request.number,
      sha: pull_request.head.sha
    });
  }

  res.status(200).send('OK');
};