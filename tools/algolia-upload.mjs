// =====================================================
// 将文章索引上传到 Algolia
//
// 用法（Windows PowerShell）：
//   npm run generate
//   $env:ALGOLIA_APP_ID = "你的AppID"
//   $env:ALGOLIA_ADMIN_API_KEY = "你的Admin API Key"
//   npm run algolia
//
// 或者一条命令：npm run algolia:all
// 注意：Admin API Key 是机密，不要提交到代码仓库。
// =====================================================

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const appId = process.env.ALGOLIA_APP_ID;
const adminKey = process.env.ALGOLIA_ADMIN_API_KEY;
const indexName = process.env.ALGOLIA_INDEX_NAME || 'posts';

if (!appId || !adminKey) {
  console.error('缺少环境变量：需要 ALGOLIA_APP_ID 和 ALGOLIA_ADMIN_API_KEY');
  process.exit(1);
}

let posts;
try {
  const searchFile = path.join(root, 'public', 'search.json');
  posts = JSON.parse(await readFile(searchFile, 'utf8'));
} catch (err) {
  console.error('读取 public/search.json 失败，请先运行 npm run generate');
  process.exit(1);
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const records = posts
  .map((post, i) => ({
    objectID: post.url || post.path || 'post-' + i,
    title: post.title || '',
    url: post.url || (post.path || '').replace(/^\//, ''),
    excerpt: stripHtml((post.content || '').slice(0, 300)),
    tags: Array.isArray(post.tags) ? post.tags : [],
    date: post.date || ''
  }))
  .filter((r) => r.title);

const base = `https://${appId}.algolia.net/1/indexes/${encodeURIComponent(indexName)}`;

async function request(subPath, init = {}) {
  const res = await fetch(base + subPath, {
    ...init,
    headers: {
      'X-Algolia-Application-Id': appId,
      'X-Algolia-API-Key': adminKey,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });
  if (!res.ok) {
    throw new Error(`Algolia 请求失败 (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

async function waitTask(taskID) {
  for (let i = 0; i < 40; i++) {
    const r = await request('/task/' + taskID);
    if (r.status === 'published') return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('等待 Algolia 清空任务超时');
}

// 先清空索引并等任务完成，再全量写入，保证与当前文章完全一致
// 索引不存在（首次上传）时 404 属正常，直接跳过清空
try {
  const clearRes = await request('/clear');
  await waitTask(clearRes.taskID);
} catch (err) {
  if (!String(err.message).includes('404')) throw err;
}
if (records.length) {
  await request('/batch', {
    method: 'POST',
    body: JSON.stringify({
      requests: records.map((r) => ({ action: 'addObject', body: r }))
    })
  });
}

console.log(`✅ 已上传 ${records.length} 篇文章到 Algolia 索引「${indexName}」`);
