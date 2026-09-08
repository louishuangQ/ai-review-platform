// MOCK DATA: local UI development only. Never use these records as production evidence.
export const dashboard = {
  cards: [
    {label: "待预览校验", value: 12, filter: "WAITING_PREVIEW_VALIDATION", note: "检查解析与元数据"},
    {label: "AI 审核中", value: 7, filter: "REVIEWING", note: "规则、报告与自校验"},
    {label: "待人工复核", value: 9, filter: "WAITING_MANUAL_REVIEW", note: "已按产品线路由"},
    {label: "需重写", value: 5, filter: "REWRITE_REQUIRED", note: "低于 20 分或人工决定"},
    {label: "最终审核报告", value: 42, filter: "FINAL_APPROVED", note: "已完成人工终审"}
  ],
  distribution: [{label: "预览", value: 12}, {label: "AI审核", value: 7}, {label: "人工", value: 9}, {label: "重写", value: 5}, {label: "完成", value: 42}],
  trend: [17, 19, 18, 21, 22, 24],
  metrics: [{label: "月度优秀文档", value: "24"}, {label: "重写率", value: "18.6%"}, {label: "复核通过率", value: "91.2%"}]
};

export const documents = [
  {id: "D042", name: "RG650E Series AT Commands Troubleshooting", source: "飞书知识库", product: "5G", workflowStatus: "WAITING_MANUAL_REVIEW", preview: "已通过", ai: "已完成", human: "待人工复核", rewrite: "未开始", final: "审核中", time: "—"},
  {id: "D049", name: "RM520N Recovery Procedure", source: "飞书知识库", product: "5G", workflowStatus: "REWRITE_REQUIRED", preview: "已通过", ai: "已完成", human: "已复核", rewrite: "等待作者", final: "需重写", time: "—"},
  {id: "D031", name: "EG915U Firmware Upgrade Best Practice", source: "本地上传", product: "LTE", workflowStatus: "FINAL_APPROVED", preview: "已通过", ai: "已完成", human: "已通过", rewrite: "已完成 2 次", final: "通过", time: "09-01 16:24"}
];

export const reviewTasks = {
  D042: { id: "D042", product: "5G", title: "RG650E Series AT Commands Troubleshooting", round: 2, status: "等待人工复核", activeNode: 3, totalScore: null },
  D043: { id: "D043", product: "LTE", title: "EG912U Network Registration Guide", round: 1, status: "生成固定式报告", activeNode: 1, totalScore: null },
  D049: { id: "D049", product: "5G", title: "RM520N Recovery Procedure", round: 2, status: "重写处理", activeNode: 4, totalScore: 18.7 },
};

export const workflowNodes = [
  {name: "AI 执行审核", state: "COMPLETED", time: "10:02—10:05", input: "CanonicalDocumentPackage", output: "ReviewRun", log: "75/75 rules traced"},
  {name: "固定式报告", state: "COMPLETED", time: "10:05—10:06", input: "ReviewRun", output: "FixedReport", log: "Schema valid"},
  {name: "AI 自校验", state: "COMPLETED", time: "10:06—10:08", input: "FixedReport + source", output: "VerificationRun", log: "Pass 8 / Fail 1 / New 1"},
  {name: "人工复核", state: "ACTIVE", time: "10:08—", input: "Initial + verification", output: "ManualDecision", log: "Waiting reviewer"},
  {name: "重写处理", state: "PENDING", time: "—", input: "Final issues", output: "New DocumentVersion", log: "Human gate"},
  {name: "最终报告", state: "PENDING", time: "—", input: "Final decision", output: "FinalReport", log: "Locked after approval"}
];

export const verification = {pass: 8, fail: 1, new: 1, missingEvidence: 0, invalidLocations: 0, scoringAnomalies: 0, manualReview: true, rerun: false};

export const systemSections = [
  ["运行", "系统运行状态", "服务健康、队列、错误率、通知和最近检查"],
  ["元数据", "文档元数据", "作者、产品线、来源、路径、版本和审核归属"],
  ["角色", "人员与角色", "RBAC、产品线范围、Backup 与角色重合"],
  ["模型", "大模型与智能体", "模型网关、参数、提示词与智能体版本"],
  ["规则", "审核规则与固定脚本", "规则集、固定报告脚本、Schema 和阈值"],
  ["自校验", "AI 自校验与执行一致性", "复审模型、证据门禁、标准样本和漂移验证"],
  ["日志", "系统操作及审核流程日志", "系统、AI、脚本、人工、通知、发布和导出审计"]
];

export const auditLogs = [
  ["10:08:18", "AI自校验", "VR-0241 完成：Pass 8 / Fail 1 / New 1", "verification-service", "成功"],
  ["10:06:12", "固定脚本", "生成 AR-D042-2，Schema 通过", "report-builder", "成功"],
  ["10:05:44", "AI审核", "75 条规则执行完成，跳过 0", "content-review", "成功"],
  ["09:58:16", "配置变更", "发布自校验提示词 verify-v1.2", "Admin", "成功"]
];
