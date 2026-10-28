# 粤语学习后台管理系统

独立的运营后台前端，连接 `yue-backend` 的 `/api/admin/**` 接口。

## 本地运行

```bash
npm install
npm run dev
```

默认接口地址为同源 `/api`；本地独立运行时可用
`VITE_API_BASE=http://localhost:8080/api` 覆盖。

## 生产入口

生产管理端复用现有服务器、域名和 TLS 证书，入口固定为
`https://gnep.online/admin/`，接口使用同源 `/api`。`npm run build` 的资源地址
以 `/admin/` 开头，产物部署到服务器 `/var/www/yue-admin`；不需要创建新服务器、
新域名或 DNS 记录。

生产发布必须先完成数据库迁移和后端验证，再切换管理端，最后发布依赖公共场景
接口的用户网页。完整备份、Nginx 路由、验证和回滚步骤见
`yue-backend/docs/admin-v1-setup.md`。

## 当前功能（第一版）

- **管理员登录**：沿用后端 `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH`（BCrypt）。
- **数据概览**：用户总数、官方场景数、已发布场景数、音频资源数、缺音频台词数，以及最近操作记录。
- **场景管理**：官方场景/台词完整 CRUD，草稿 / 发布 / 下架状态切换，版本冲突保护（并发保存返回 409），分类 / 难度 / 排序 / 粤拼编辑，对话预览；用户自建场景只读查看。
- **音频管理**：MP3 / WAV 上传（单文件最多 20 MiB）、替换、删除，内置静态素材只读，被引用台词计数与引用删除保护。
- **用户管理**：用户列表（手机号脱敏）与只读学习进度、收藏详情。
- **操作记录**：按操作类型、时间范围筛选，北京时间展示。
- **电影配音素材**：素材/Part/台词管理、视频上传、发布/下架、版本冲突保护；每条素材支持 JPEG/PNG 封面上传、替换和授权预览（最大 5 MiB，已发布素材须先下架）。

网页端与小程序官方场景已改读公共 API（`/api/public/scenes`），本地自建内容保留。

## 状态

2026-10-28：封面管理已部署到既有 `https://gnep.online/admin/`，后端迁移和两条素材封面导入完成。当前管理端 16 项测试和构建通过；真实 API 验收覆盖封面上传、替换、版本冲突、无效图片拒绝及临时数据清理。当前 JS 为 `index-VjX__b-e.js`。管理员密码表单的可视化登录未在本轮验收；不能用 API 验收代替该项。详见：

- 实施记录 `docs/admin-v1-progress.md`
- 验证记录 `docs/admin-v1-validation.md`
- 运行及发布说明 `yue-backend/docs/admin-v1-setup.md`
- 本轮发布记录 `yue-backend/docs/dubbing-cover-release-2026-10-28.md`（完整工作区中的后端仓库）
