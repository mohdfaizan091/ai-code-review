import crypto from 'crypto';
import { getPRFiles, postPRReview, getFileContent, getRelatedFilesContent, getFolderFiles } from '../services/githubService.js';
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

    // Har changed file ke liye related files fetch karo, ek array mein combine karo
    let allRelatedFiles = [];
for (const file of files) {
  if (!file.patch) continue;
  try {
    const fullFileContent = await getFileContent(
      repository.owner.login,
      repository.name,
      file.filename,
      pull_request.head.sha
    );

    const importedFiles = await getRelatedFilesContent(
      repository.owner.login,
      repository.name,
      pull_request.head.sha,
      file.filename,
      fullFileContent
    );

    const folderFiles = await getFolderFiles(
      repository.owner.login,
      repository.name,
      file.filename,
      pull_request.head.sha
    );

    // Dono lists combine + dedupe (agar koi file dono jagah aa gayi ho)
    const combined = [...importedFiles, ...folderFiles];
    const seen = new Set();
    const uniqueRelated = combined.filter(f => {
      if (seen.has(f.path)) return false;
      seen.add(f.path);
      return true;
    });

    allRelatedFiles.push(...uniqueRelated);
  } catch (e) {
    console.warn(`Related files fetch failed for ${file.filename}:`, e.message);
  }
}

const review = await reviewPRDiff(files, allRelatedFiles);

    if (review.files.some(f => f.issues.length > 0)) {
      await postPRReview(
        repository.owner.login,
        repository.name,
        pull_request.number,
        pull_request.head.sha,
        review
      );
      console.log('Review posted to PR');
    } else {
      console.log('No issues found, skipping comment post');
    }
  } catch (err) {
    console.error('Failed to review/post PR:', err.message);
  }
}
};