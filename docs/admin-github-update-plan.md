# 粤语学习后台与 GitHub 更新实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 验证并推送现有后端与用户端改动，新增独立后台管理端及其管理员 API，再将三个项目同步到 GitHub。

**Architecture:** 保留 `yue-backend` 和 `yue-frontend` 两个独立仓库；新增独立 `yue-admin` React/Vite 工程。后台通过 `/api/admin/**` 调用后端，使用带管理员声明的 JWT；现有用户端接口和页面保持兼容。

**Tech Stack:** Spring Boot 3.2, Java 21, JPA, Spring Security, JWT, React 19, TypeScript, Vite, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-21-admin-system-design.md`

## Global Constraints

- 管理后台首期面向少数运营人员，不实现完整 RBAC。
- 普通用户 JWT 不得访问 `/api/admin/**`。
- 用户管理响应不得返回密码哈希，手机号和微信标识需要脱敏。
- 每个仓库在 push 前必须完成对应测试和构建。
- 不把媒体大文件、依赖目录、构建产物推入 Git。

## Review Focus

- 现有后端未提交改动是否能通过完整 Maven 测试。
- 现有前端改动是否能通过 Vitest 和生产构建。
- 管理员 token 与普通用户 token 的权限边界。
- 场景删除时关联台词和不存在资源的错误处理。
- 后台 401/403、空列表、分页和表单保存失败状态。

---

### Task 1: 验证并提交现有后端改动

**Files:**
- Modify only files already changed under `yue-backend/`.
- Test existing `yue-backend/src/test/`.

- [ ] 运行 `mvn test`，记录失败测试和失败原因。
- [ ] 修复仅限于现有改动导致的编译或测试问题。
- [ ] 运行 `mvn test` 直到通过。
- [ ] 检查 `git diff --check`，确认没有空白错误和敏感配置。
- [ ] 提交：`git add . && git commit -m "feat: add user profile scene and tts APIs"`。
- [ ] 推送：`git push origin main`。

### Task 2: 验证并提交现有用户端改动

**Files:**
- Modify only files already changed under `yue-frontend/`.
- Test `yue-frontend/src/__tests__/`.

- [ ] 运行 `npm test -- --run`。
- [ ] 运行 `npm run build`。
- [ ] 修复仅限于现有改动导致的问题。
- [ ] 重新运行测试和构建。
- [ ] 检查 `git diff --check`。
- [ ] 提交：`git add . && git commit -m "feat: improve web learning experience"`。
- [ ] 推送：`git push origin main`。

### Task 3: 创建独立后台工程

**Files:**
- Create `yue-admin/package.json`, `yue-admin/vite.config.ts`, `yue-admin/tsconfig.json`, `yue-admin/index.html`.
- Create `yue-admin/src/main.tsx`, `yue-admin/src/App.tsx`, `yue-admin/src/index.css`.
- Create `yue-admin/src/lib/api.ts`, `yue-admin/src/lib/auth.ts`.
- Create pages for Login, Dashboard, Scenes, SceneDetail, Users, UserDetail.

- [ ] 初始化 React/Vite/TypeScript 工程和测试脚本。
- [ ] 实现会话存储、统一 fetch 客户端、401/403 处理。
- [ ] 实现登录页和受保护路由。
- [ ] 实现桌面端布局、导航和三个业务模块。
- [ ] 编写前端测试覆盖登录态、导航、场景保存和错误态。
- [ ] 运行 `npm test -- --run` 和 `npm run build`。

### Task 4: 增加后端管理员认证和管理 API

**Files:**
- Modify `yue-backend/src/main/java/com/yue/config/SecurityConfig.java` and JWT security classes.
- Create admin auth DTO/controller/service.
- Create admin dashboard, scene and user controllers/services/DTOs.
- Create tests under `yue-backend/src/test/java/com/yue/admin/`.
- Modify `yue-backend/src/main/resources/application.yml` with non-secret admin configuration keys.

- [ ] 增加配置化管理员账号和密码哈希校验。
- [ ] 让管理员 JWT 带 `admin=true` 声明，并在 `/api/admin/**` 强制校验。
- [ ] 实现 dashboard、场景/台词 CRUD、用户分页详情接口。
- [ ] 对用户字段脱敏，不返回密码哈希。
- [ ] 编写权限边界、CRUD、分页和错误状态测试。
- [ ] 运行完整 `mvn test`。

### Task 5: 联调后台并提交

**Files:**
- Modify `yue-admin/src/lib/api.ts` and pages only as required by real backend responses.
- Add `yue-admin/README.md` with local run instructions.

- [ ] 启动后端和后台前端，验证管理员登录、概览、场景编辑、用户查看。
- [ ] 修复接口字段、CORS、错误状态和表单交互问题。
- [ ] 运行后台测试和构建。
- [ ] 提交并推送 `yue-admin`。
- [ ] 将后端管理 API 的最终改动提交并推送。

### Task 6: 最终同步检查

- [ ] 对三个仓库分别运行 `git status`、`git log -1`、`git remote -v`。
- [ ] 使用 `git ls-remote origin main` 确认远端已包含最新提交。
- [ ] 汇总三个仓库的提交号、测试结果和运行入口。
