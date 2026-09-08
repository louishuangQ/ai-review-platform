# AI Review Web — 本地展示版
保留审核总览、文档中心、智能审核、审核报告、系统管理、操作日志六个入口。
采用 React + TypeScript + Vite，蓝紫色企业后台，电脑及窄屏自适应。

## 本地运行
要求 Node.js 22.13+ 或 24 LTS。
首次安装：`npm ci`（按 lockfile 安装）。
开发：`npm run dev:local`。
稳定展示：`npm run preview:local`（先构建，再启动本地静态预览并打开浏览器）。
固定地址：http://127.0.0.1:4174
也可双击本仓库的 `启动本地展示.cmd`。
端口已被占用时直接退出并提示；不会占用新端口或结束其他进程。
结束展示：在启动窗口按 Ctrl+C。无需 Docker 或企业凭证。

## 代码版块与职责
| 路径 | 职责 |
|---|---|
| src/App.tsx + lib/navigation.ts | hash 路由、深链接与浏览器前进后退 |
| src/components/Shell.tsx | 页面外壳、导航、明确的演示模式标识 |
| src/components/Card.tsx / Badge.tsx / Modal.tsx | 共享卡片、状态标签和原生可访问弹窗 |
| src/pages/OverviewPage.tsx | 汇总与文档下钻，数量来自同一数据集 |
| src/pages/DocumentsPage.tsx | 状态、作者/名称、产品线过滤与原文预览 |
| src/pages/ReviewPage.tsx | 逐文档流程、报告、证据与人工评分展示 |
| src/pages/ReportsPage.tsx | 最终确认报告及时间段批次结果，支持 JSON 导出 |
| src/pages/SystemPage.tsx | 七类管理配置与本地接入、计划草稿 |
| src/components/ManualReviewPanel.tsx | 人工逐项裁决、五维评分、草稿导出 |
| src/components/ConnectionSettings.tsx | 服务端口、知识库、周期计划配置草稿 |
| src/components/PeriodResults.tsx | 时间段批次计数、关联文档当前快照 |
| src/pages/LogsPage.tsx | 文档审计记录筛选、下钻与 JSON 导出 |
| src/domain/platform.ts | UI 只读模型与适配器契约，不承担评分与流程裁决 |
| src/adapters/platform.ts | 所有页面的数据访问入口 |
| src/mocks/demo.ts / operations.ts | 脱敏文档、批次与明确标记的本地配置适配 |
| src/lib/download.ts | 本地 JSON 下载 |
| src/local-preview.css | 当前主题、共享控件和响应式布局 |

旧 `src/styles.css`、`src/mocks/platform.ts` 为此前基线，当前未导入。
六个页面使用同一份文档记录。历史趋势是单独标注的演示序列。
无效文档编号显示不存在；不会回退至其他文档。
前置流程未完成时不展示后续结果；AI 和人工评分分列，待人工评分时总分为空。

## 演示顺序
1. 总览点击“待人工复核”，文档列表应只有两份样本。
2. 点击原文预览；按 Escape 关闭弹窗。
3. 进入 D042；切换流程节点，查看 Pass / Fail / New 与原文证据。
4. 切换 D043；尚未执行的自校验不得显示结果。
5. 切换 D049；人工分与重写状态对应。查看 D031 完成记录。
6. 审核报告导出最终确认的两份样本；日志页面按编号筛选并导出。
7. 系统管理七类配置切换。

## API 与服务边界
当前明确为 MOCK 展示，独立运行不要求启动后端。
现有 .env.example 中 API 地址为未来接入预留，不会自动切换为真实后端。
后续新增 HTTP adapter，沿用 domain 接口并增加加载、错误、权限状态；
连接失败不得静默返回演示数据。
规则、权重、审核执行、状态转换和人工最终决定归各自业务仓库所有。
原有 14 个仓库边界不变。本仓库只交付前端，不包含其他服务实现；代码上传不代表生产部署或真实飞书、模型和后台调度已经接通。
人工评分与接入计划的实现边界见 [docs/OPERATIONS.md](docs/OPERATIONS.md)。

## 验证
`npm run format`：统一当前源码格式（不重写历史未引用基线）。
`npm run format:check`：格式检查。
`npm test`：用户路径和数据一致性回归。
`npm run lint`：TypeScript 静态检查。
`npm run build`：生产构建。
浏览器截图与操作检查存于工作区 `output/playwright/`（不属于服务交付代码）。
