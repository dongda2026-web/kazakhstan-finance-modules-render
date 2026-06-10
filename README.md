# 哈萨克斯坦金融模块看板

面向哈萨克斯坦银行、汇率、股票、政策、环球财经快讯和 AI 分析的模块化金融看板。

## Render 部署

Render 会读取 `render.yaml`：

- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Node service entry: `server.cjs`
- Static output: `dist`

AI 翻译和 AI 简报需要在 Render 环境变量中配置：

```text
ANTHROPIC_API_KEY
```

不配置该变量时，页面、基础新闻抓取和汇率模块仍可使用。
