# AGENTS.md

## 项目定位

个人博客网站，技术框架为 **静态网站 + 第三方服务**：

- 静态生成：Hexo 7 + 自研主题 `plain`（EJS）
- 评论：Giscus（基于 GitHub Discussions）
- 搜索：Algolia（未配置时自动回退本地搜索）
- 部署：GitHub Actions 自动构建并发布到 GitHub Pages

核心设计目标：**可长期维护**，且**内容、域名、URL 结构便于日后迁移到动态网站**（如 WordPress）。

> 本聊天后续主要围绕**网站底层结构设计及框架调整**展开（如换 SSG、主题重构、部署目标变化、评论/搜索方案调整等），而非日常写作内容。涉及结构性改动前，请先阅读本文件与 README.md。

## 当前状态（截至 2026-08-17）

- 已上线：https://dennys-oss.github.io/111/（线上验证通过：首页 200、Giscus 已渲染、Algolia 搜索命中正常）
- 代码仓库：本地 `D:\blog`，远程 `https://github.com/dennys-oss/111.git`（分支 `main`，工作区干净）
- Giscus：`themes/plain/_config.yml` 中已配置 `repo`、`repo_id`、`category`、`category_id`
- Algolia：App ID `T7AP1X62E8`、Search-Only Key 已写入主题配置；Admin Key 仅存于 GitHub Actions Secrets（`ALGOLIA_APP_ID` / `ALGOLIA_ADMIN_API_KEY`）
- 自动部署：`.github/workflows/deploy.yml` 每次 push 到 `main` 自动构建 + 上传 Algolia 索引 + 发布 Pages

## 架构决策与约束

1. **内容与展示分离**：文章全部是 `source/_posts/` 下的标准 Markdown + front matter（title/date/categories/tags/excerpt），不依赖编辑器或主题格式，任何系统都可导入。
2. **URL 结构**：`permalink: :title/`，网址等于文章文件名，保持简洁稳定；新建文章建议用英文/拼音文件名。
3. **站点地址集中管理**：`_config.yml` 的 `url` 是唯一权威站点地址（当前为 GitHub Pages 子路径 `/111/`）；改域名只需改这一处并重新生成。
4. **Giscus 渲染条件**：`repo`、`repo_id`、`category_id` 三者齐全才渲染评论组件，避免输出残缺配置。
5. **Algolia 上传脚本**（`tools/algolia-upload.mjs`）：
   - 数据源：`public/search.json`（由 hexo-generator-search 生成，字段为 `title/url/content/tags/categories`，注意是 `url` 而非 `path`）
   - 写入策略：先 `/clear` 并**等待任务完成**再批量 `addObject`；索引不存在（首次上传）时 404 属正常，跳过清空
   - `objectID` 与记录 `url` 直接使用 `post.url`（包含 `/111/` 基路径，适配子路径部署）
6. **前端搜索**（`themes/plain/layout/search.ejs`）：检测到 Algolia 配置则走 Algolia；否则回退到本地 `search.json` 搜索。两种路径的结果链接均使用相对路径。
7. **部署环境**：GitHub Actions 使用 **Node 24** + pnpm 11（pnpm 11 需要 Node ≥ 22.5，不要改回 Node 20）；`pnpm-workspace.yaml` 中的 `allowBuilds: hexo-util` 为安装必需。
8. **安全**：Admin Key 等机密只通过环境变量 / GitHub Secrets 传递，不写入仓库；`themes/plain/_config.yml` 中的 Search-Only Key 可公开。

## 常用命令

```powershell
npm run new -- 文章名        # 新建文章（Markdown）
npm run server               # 本地预览 http://localhost:4000
npm run generate             # 生成 public/
npm run algolia              # 上传索引（需先设置 ALGOLIA_APP_ID / ALGOLIA_ADMIN_API_KEY 环境变量）
npm run algolia:all          # 生成 + 上传一条龙
npm run deploy               # 手动部署（备选方案，默认走 GitHub Actions）
git push                     # 推送到 main 即自动上线
```

## 目录结构

```
blog/
├── .github/workflows/deploy.yml   # 自动构建 + Algolia 上传 + Pages 部署
├── _config.yml                    # 站点配置（url、permalink、feed、sitemap、search、deploy）
├── themes/plain/
│   ├── _config.yml                # 主题配置（菜单、Giscus、Algolia）
│   ├── layout/                    # EJS 模板（index/post/page/search/archive/category/tag + partials）
│   └── source/css/main.css        # 样式（深色模式、页脚吸底）
├── source/                        # 内容：_posts、about、search、categories、tags、404、robots.txt
├── tools/algolia-upload.mjs       # Algolia 索引上传脚本
├── scaffolds/                     # 新建文章模板
└── README.md                      # 面向站长的完整使用/配置/迁移教程
```

## 后续方向（本聊天重点关注）

- 底层结构设计：目录组织、数据流、模板体系、可迁移性设计
- 框架调整：更换 SSG（如 Hugo / Astro）、主题重构、评论/搜索方案调整、部署目标变化（阿里云 / OSS / 自定义域名）
- 外部约束提醒：若迁移到阿里云**大陆**服务器需 ICP 备案（周期 1–3 周）；香港/海外节点或 OSS 无需备案
- 结构性改动保持“迁移友好”约束：Markdown 内容、简洁 URL、集中式配置
