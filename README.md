# 粤语学习后台管理系统

独立的运营后台前端，连接 `yue-backend` 的 `/api/admin/**` 接口。

## 本地运行

```bash
npm install
npm run dev
```

默认接口地址为 `http://localhost:8080/api`，可通过 `VITE_API_BASE` 覆盖。

## 当前功能

- 管理员登录
- 用户数和场景数概览
- 用户列表及手机号脱敏
- 场景内容入口（完整 CRUD 接口仍在后续完善）

项目总结和设计文档见 `docs/`。
