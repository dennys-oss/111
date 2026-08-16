# 我的博客

一个以 **静态网站 + 第三方服务** 为框架的个人博客：

- **静态网站**：Hexo 构建，页面提前生成，速度快、免费托管、几乎零维护
- **评论**：Giscus（基于 GitHub Discussions，无需自建数据库）
- **搜索**：Algolia（实时全站搜索）
- **可迁移**：内容全部是 Markdown，URL 使用简洁的 `:title/` 结构，以后想换动态网站（如 WordPress）成本很低

---

## 目录结构

```
blog/
├── _config.yml              # 网站主配置（标题、URL、部署等）
├── package.json             # 依赖与常用命令
├── scaffolds/               # 新建文章的模板
├── source/
│   ├── _posts/              # 所有文章（Markdown）
│   ├── about/               # 关于页面
│   ├── search/              # 搜索页面
│   ├── categories/          # 分类页面
│   └── tags/                # 标签页面
├── themes/
│   └── plain/               # 主题（含 Giscus 和 Algolia 配置）
│       └── _config.yml      # 主题配置：菜单、Giscus、Algolia
└── tools/
    └── algolia-upload.mjs   # 把文章上传到 Algolia 的脚本
```

---

## 一、本地运行

需要安装 [Node.js](https://nodejs.org/)（14 以上版本）。

```powershell
cd D:\blog
npm install
npm run server
```

浏览器打开 http://localhost:4000 即可预览。

## 二、写文章

```powershell
npm run new -- 文章英文名
```

建议用**英文或拼音文件名**（如 `my-first-post`），这样网址是 `/my-first-post/`，更利于 SEO 和日后迁移；中文标题写在文章内容里即可。

文章头部（front matter）示例：

```markdown
---
title: 我的第一篇文章
date: 2026-08-17
categories: [生活]
tags: [随笔]
excerpt: 文章摘要，显示在首页列表。
---
```

写完运行 `npm run generate` 生成网站，`npm run server` 预览。

---

## 三、开启 Giscus 评论

1. 创建一个公开的 GitHub 仓库（例如 `blog-comments`），并进入仓库 Settings → General → 勾选 **Discussions**（启用后可在 Issues 页签看到 Discussions 入口）。
2. 打开 [giscus.app](https://giscus.app)，在网页中填入你的仓库地址（格式 `用户名/仓库名`），并选择分类（如 `Announcements`）。
3. giscus.app 会自动生成一段脚本，把其中的 `data-repo`、`data-repo-id`、`data-category`、`data-category-id` 四个值抄下来。
4. 编辑 `themes/plain/_config.yml`，填写：

```yaml
giscus:
  enable: true
  repo: "你的用户名/你的仓库名"
  repo_id: "从 giscus.app 复制"
  category: "Announcements"
  category_id: "从 giscus.app 复制"
```

5. 重新运行 `npm run generate`，文章底部就会出现评论框。

---

## 四、开启 Algolia 搜索

### 1. 注册并建索引

1. 到 [algolia.com](https://www.algolia.com/) 注册免费账号（Free 计划够用）。
2. 在控制台创建一个索引，名称建议用 `posts`。
3. 在 **API Keys** 页面记下两个值：
   - **Application ID**
   - **Search-Only API Key**（可公开，写进主题配置）
   - **Admin API Key**（机密，只用于上传，不要写进配置文件）

### 2. 写入前端配置

编辑 `themes/plain/_config.yml`：

```yaml
algolia:
  enable: true
  app_id: "你的Application ID"
  search_api_key: "你的Search-Only API Key"
  index_name: "posts"
```

### 3. 上传文章索引

每次写完文章、生成网站后运行（Windows PowerShell）：

```powershell
npm run generate
$env:ALGOLIA_APP_ID = "你的Application ID"
$env:ALGOLIA_ADMIN_API_KEY = "你的Admin API Key"
npm run algolia
```

也可以一步到位：`npm run algolia:all`（会先构建再上传）。

完成后访问 `/search/` 页面，输入关键词即可实时搜索。

---

## 五、发布上线

### 方式一：GitHub Pages（推荐，免费）

1. 在 GitHub 新建一个仓库，例如 `你的用户名.github.io`。
2. 在 `_config.yml` 中修改 `deploy.repo` 为你的仓库地址。
3. 命令行执行：

```powershell
git init
git add .
git commit -m "first commit"
npm run deploy
```

几分钟后访问 `https://你的用户名.github.io`。

### 方式二：Vercel / Netlify（免费）

导入仓库后，构建命令填 `hexo generate`，输出目录填 `public` 即可，之后每次 push 自动发布。

---

## 六、日后迁移到动态网站

这个博客从一开始就为迁移做好了准备：

- **内容**：文章都在 `source/_posts/`，是标准 Markdown + front matter，WordPress 等系统可以直接导入。
- **URL**：`permalink: :title/`，网址就是文章文件名，简单稳定。
- **图片**：建议把图片放到 `source/images/`，与文章分开管理。
- **评论**：Giscus 绑定 GitHub 仓库；如果换系统，评论可在 GitHub Discussions 中查看，也可用工具迁移。
- **搜索**：Algolia 不依赖静态站，换成 WordPress 后直接换用官方插件即可。

真正需要重做的只有主题外观，内容、域名、搜索都能保留。

---

## 常见问题

**为什么建议用英文文件名？**
网址直接来自文件名，英文/拼音文件名能让 URL 简短稳定，迁移时也更容易保持地址不变。

**Admin API Key 写进代码了怎么办？**
立即到 Algolia 控制台重置 Admin Key。它只应通过环境变量传入上传脚本。

**写完文章没出现在搜索里？**
每次新增或修改文章后都要重新运行 `npm run algolia`（或 `npm run algolia:all`）上传索引。
