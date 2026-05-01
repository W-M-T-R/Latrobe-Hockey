import { promises as fs } from 'node:fs';
import path from 'node:path';
import { contentDir, saveContent, type PageKey } from './content';

const GH = {
  token: process.env.GITHUB_TOKEN,
  owner: process.env.GITHUB_OWNER,
  repo: process.env.GITHUB_REPO,
  branch: process.env.GITHUB_BRANCH || 'main',
  pathPrefix: process.env.GITHUB_PATH_PREFIX ?? '',
};

function ghEnabled(): boolean {
  return Boolean(GH.token && GH.owner && GH.repo);
}

async function ghPutFile(repoPath: string, contentBase64: string, message: string): Promise<void> {
  const url = `https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/${encodeURIComponent(repoPath).replace(/%2F/g, '/')}`;
  const headers = {
    Authorization: `Bearer ${GH.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  let sha: string | undefined;
  const head = await fetch(`${url}?ref=${encodeURIComponent(GH.branch)}`, { headers });
  if (head.ok) {
    const j: any = await head.json();
    sha = j.sha;
  }
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify({
      message,
      content: contentBase64,
      branch: GH.branch,
      sha,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub PUT ${repoPath} failed (${res.status}): ${txt}`);
  }
}

export async function persistContent(key: PageKey, data: unknown): Promise<{ via: 'local' | 'github' }> {
  await saveContent(key, data);
  if (!ghEnabled()) return { via: 'local' };
  const json = JSON.stringify(data, null, 2) + '\n';
  const b64 = Buffer.from(json, 'utf8').toString('base64');
  const repoPath = joinRepoPath(GH.pathPrefix, `src/content/${key}.json`);
  await ghPutFile(repoPath, b64, `cms: update ${key} content`);
  return { via: 'github' };
}

function joinRepoPath(prefix: string, rest: string): string {
  const p = prefix.replace(/^\/+|\/+$/g, '');
  return p ? `${p}/${rest}` : rest;
}

export async function persistImage(filename: string, bytes: Buffer): Promise<{ url: string; via: 'local' | 'github' }> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
  const stamp = Date.now();
  const finalName = `${stamp}-${safeName}`;
  const urlPath = `/uploads/${finalName}`;

  // Best-effort local write so dev mode serves the file immediately. On Netlify
  // the function FS is read-only — that's fine, GitHub commit below is the source of truth.
  try {
    const publicDir = path.resolve(contentDir(), '..', '..', 'public', 'uploads');
    await fs.mkdir(publicDir, { recursive: true });
    await fs.writeFile(path.join(publicDir, finalName), bytes);
  } catch (e: any) {
    if (e.code !== 'EROFS' && e.code !== 'EACCES' && e.code !== 'ENOENT') throw e;
  }

  if (!ghEnabled()) return { url: urlPath, via: 'local' };
  const b64 = bytes.toString('base64');
  const repoPath = joinRepoPath(GH.pathPrefix, `public/uploads/${finalName}`);
  await ghPutFile(repoPath, b64, `cms: upload image ${finalName}`);
  return { url: urlPath, via: 'github' };
}

export function persistMode(): 'github' | 'local' {
  return ghEnabled() ? 'github' : 'local';
}
