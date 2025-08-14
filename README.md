# AI Brief (Vercel + Next.js + Cron + KV)

每天定时（JST 9:00 / UTC 00:00）生成“AI 产品每日简报”，并在前端用科技感模板展示。

## 快速开始
1. `npm i`
2. 复制 `.env.example` -> `.env.local`，填入 `OPENAI_API_KEY`、`KV_REST_API_URL`、`KV_REST_API_TOKEN`。
3. `npm run dev` 本地预览。
4. 部署到 Vercel，并在 **Settings → Environment Variables** 配置同样的变量。
5. `vercel.json` 已包含 Cron：`0 0 * * *`（UTC）= 日本时间每天 9:00 调用 `/api/cron-generate`。

## API
- `GET /api/brief` 获取最新简报 JSON。
- `GET /api/cron-generate` 构建当日简报并写入 KV（由 Vercel Cron 触发）。

## 自定义
- 修改 `app/(site)/page.tsx` 中的样式即可更换主题/品牌色/Logo。
- 提示词在 `app/api/cron-generate/route.ts`，可加入你的“追踪清单”。
