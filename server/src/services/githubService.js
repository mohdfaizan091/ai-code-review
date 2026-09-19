export async function getPRFiles(owner, repo, pullNumber) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files`;

  const response = await fetch(url, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json(); // array of { filename, status, patch, additions, deletions, ... }
}

export async function postPRReview(owner, repo, pullNumber, commitSha, files) {
  const comments = [];

  for (const file of files.files) {
    for (const issue of file.issues) {
      comments.push({
        path: file.filename,
        line: issue.line,
        side: "RIGHT", // RIGHT = naya code (added lines), LEFT = purana code (removed lines)
        body: `**[${issue.severity.toUpperCase()}]** ${issue.message}`,
      });
    }
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      commit_id: commitSha,
      body: files.summary, // ye overall review body banta hai (summary wala)
      event: "COMMENT", // APPROVE/REQUEST_CHANGES nahi — bot ko itna authority abhi mat do
      comments,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GitHub review post error: ${response.status} - ${errorText}`);
  }

  return response.json();
}