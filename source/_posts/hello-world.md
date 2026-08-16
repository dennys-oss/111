---
title: 博客上线了
date: 2026-08-17
categories: [随想]
tags: [博客, 建站]
excerpt: 这是本站的第一篇文章，简单介绍一下这个博客用了什么技术。
---

欢迎来到我的博客！

本站使用**静态网站**构建：页面在发布前就生成好，访问速度快、几乎不需要维护成本。

- **评论**：由 Giscus 提供，基于 GitHub Discussions，无需自建数据库
- **搜索**：由 Algolia 提供，实时全站搜索
- **内容**：全部是 Markdown 文件，日后迁移到任何博客系统都很方便

用 `npm run new -- 文章名` 创建新文章，用 `npm run generate` 生成网站，用 `npm run deploy` 发布。
