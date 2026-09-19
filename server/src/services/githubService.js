import path from 'path';

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


// Poori file ka content fetch karta hai (patch nahi, actual full file)
export async function getFileContent(owner, repo, filePath, ref) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${ref}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!response.ok) {
    throw new Error(`404-ish: ${response.status}`); // guess-and-check ke liye chhota error
  }
  const data = await response.json();
  return Buffer.from(data.content, 'base64').toString('utf-8'); // GitHub content base64 mein deta hai
}

// File ke andar se saare relative imports/requires nikalta hai
export function extractImportPaths(fileContent) {
  const importRegex = /(?:import\s+.*?from\s+|require\()\s*['"](\.{1,2}\/[^'"]+)['"]\)?/g;
  const paths = new Set();
  let match;
  while ((match = importRegex.exec(fileContent)) !== null) {
    paths.add(match[1]);
  }
  return [...paths];
}

// "./utils/helper" jaisa relative path ko repo-root-relative path mein convert karta hai
function resolveImportPath(changedFilePath, importPath) {
  const dir = path.dirname(changedFilePath);
  return path.posix.normalize(path.posix.join(dir, importPath));
}

// Extension guess karke actual file dhundta hai (kyunki imports mein extension often missing hota hai)
const POSSIBLE_EXTENSIONS = ['', '.js', '.mjs', '/index.js'];

export async function getRelatedFilesContent(owner, repo, ref, changedFilePath, changedFileContent, maxFiles = 3) {
  const importPaths = extractImportPaths(changedFileContent).slice(0, maxFiles);
  const relatedFiles = [];

  for (const importPath of importPaths) {
    const basePath = resolveImportPath(changedFilePath, importPath);

    for (const ext of POSSIBLE_EXTENSIONS) {
      try {
        const content = await getFileContent(owner, repo, basePath + ext, ref);
        relatedFiles.push({ path: basePath + ext, content });
        break; // mil gaya, agla import path try karo
      } catch {
        continue; // ye extension nahi tha, next try karo
      }
    }
  }

  return relatedFiles;
}

// Changed file ke SAME FOLDER ki baaki .js files fetch karta hai
export async function getFolderFiles(owner, repo, changedFilePath, ref, maxFiles = 5) {
  const dirPath = path.posix.dirname(changedFilePath);
  const apiPath = dirPath === '.' ? '' : dirPath; // root folder ke liye special case

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${apiPath}?ref=${ref}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) return []; // folder resolve na ho toh silently skip, crash mat karo

  const items = await response.json();
  if (!Array.isArray(items)) return [];

  const jsFiles = items
    .filter(item => item.type === 'file' && /\.(js|mjs)$/.test(item.name) && item.path !== changedFilePath)
    .slice(0, maxFiles);

  const results = [];
  for (const item of jsFiles) {
    try {
      const content = await getFileContent(owner, repo, item.path, ref);
      results.push({ path: item.path, content });
    } catch {
      continue; // ek file fail ho toh baaki try karo, poora process mat roko
    }
  }
  return results;
}