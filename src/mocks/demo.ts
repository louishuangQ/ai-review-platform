/** MOCK ONLY — synthetic records for local presentation, never audit evidence. */
import type { DocumentRecord, FilterOption, ReviewIssue, Tone } from "../domain/platform";

export const filters: FilterOption[] = [
  { value: "ALL", label: "全部文档", tone: "neutral" },
  { value: "WAITING_PREVIEW_VALIDATION", label: "待预览校验", tone: "amber" },
  { value: "REVIEWING", label: "AI 审核中", tone: "blue" },
  { value: "WAITING_MANUAL_REVIEW", label: "待人工复核", tone: "purple" },
  { value: "REWRITE_REQUIRED", label: "需重写", tone: "red" },
  { value: "FINAL_APPROVED", label: "最终审核报告", tone: "green" },
];
const stages = ["AI 执行审核", "固定式报告", "AI 自校验", "人工复核", "重写处理", "最终报告"];
const owners = ["规则检查器", "固定报告脚本", "自校验服务", "人工审核员", "重写工作台", "人工终审"];
const inputs = [
  "标准文档包",
  "规则及补充结果",
  "固定报告与原文",
  "初审与复审记录",
  "人工重写建议",
  "人工最终决定",
];
const outputs = [
  "逐规则执行记录",
  "结构化报告",
  "逐项复审结果",
  "人工评分与决定",
  "新版本文档",
  "最终审核报告",
];
const dimensions = ["可操作性", "内容结构完整性", "可读性", "内容差异性", "适用性"];
const seeds = [
  ["D042", "RG650E AT 命令故障排查指南", "5G", "林雨", "WAITING_MANUAL_REVIEW", 3, null, 2],
  ["D043", "EG912U 网络注册与异常处理", "LTE", "陈安", "REVIEWING", 1, null, 1],
  ["D049", "RM520N 固件恢复操作手册", "5G", "周宁", "REWRITE_REQUIRED", 4, 18.7, 2],
  ["D031", "EG915U 固件升级最佳实践", "LTE", "许清", "FINAL_APPROVED", 5, 22.6, 3],
  ["D052", "LC29H 定位精度测试指南", "GNSS", "苏禾", "WAITING_PREVIEW_VALIDATION", -1, null, 1],
  ["D053", "BG95 低功耗配置说明", "LPWA", "林雨", "WAITING_MANUAL_REVIEW", 3, null, 1],
  ["D028", "EC200U 串口调试指南", "LTE", "周宁", "FINAL_APPROVED", 5, 21.5, 1],
  ["D054", "RG255C 网络接入配置", "5G", "陈安", "REVIEWING", 0, null, 1],
] as const;
const excerpts: Record<string, string> = {
  D042: "连接设备后执行 AT 命令，若返回异常，请重新尝试。",
  D043: "查询网络注册状态后，根据返回值进入相应处理步骤。",
  D049: "升级失败时，直接断电并重新刷写固件。",
  D031: "升级前确认固件版本并备份配置；失败后按回退步骤恢复。",
  D052: "将天线连接至模块，记录卫星数量和定位精度。",
  D053: "进入休眠模式前，设置网络参数并确认驻网状态。",
  D028: "确认串口电平和波特率后，发送命令并保存返回日志。",
  D054: "接入网络前确认 SIM 卡状态和网络制式。",
};
export const documents: DocumentRecord[] = seeds.map((seed, index) => {
  const [id, name, product, author, status, activeNode, finalScore, round] = seed;
  const config = filters.find((f) => f.value === status)!;
  const finalConfirmed = status === "FINAL_APPROVED";
  const verificationReady = activeNode >= 3;
  const evidence = excerpts[id];
  const issues: ReviewIssue[] = verificationReady
    ? [
        {
          id: id + "-01",
          dimension: "可操作性",
          result: "Pass",
          block: "b-002 · 操作步骤 / 第 2 段",
          evidence,
          problem: id === "D049" ? "缺少安全回退条件" : "异常处理需要明确验证动作",
          suggestion: "补充操作前提、返回值判断和失败后的回退步骤。",
        },
        ...(id === "D042"
          ? [
              {
                id: id + "-02",
                dimension: "可读性",
                result: "Fail" as const,
                block: "b-001 · 适用范围 / 第 1 段",
                initialProblem: "初审判定：产品型号存在拼写问题（保留待复核）",
                initialSuggestion: "初审建议：检查产品型号拼写。复审建议在自校验页单独展示。",
                evidence: "本文适用于 RG650E 系列模块。",
                problem: "初审将产品型号判为拼写问题，复审认为证据不足",
                suggestion: "保留初审记录，建议人工撤销该项扣分。",
              },
              {
                id: id + "-03",
                dimension: "适用性",
                result: "New" as const,
                block: "b-001 · 适用范围 / 第 1 段",
                evidence: "本文适用于 RG650E 系列模块。",
                problem: "复审新增：缺少适用固件版本范围",
                suggestion: "标明已验证固件版本和不适用场景。",
              },
            ]
          : []),
      ]
    : [];
  return {
    id,
    name,
    product,
    author,
    workflowStatus: status,
    statusLabel: config.label,
    tone: config.tone,
    source: index % 3 === 1 ? "本地上传" : "飞书知识库",
    updated: "2026-09-08 10:" + (10 + index),
    preview: activeNode < 0 ? "待校验" : "已通过",
    ai: activeNode >= 3 ? "已完成" : activeNode < 0 ? "未开始" : "执行中",
    human: finalConfirmed
      ? "最终确认"
      : activeNode === 4
        ? "已复核"
        : activeNode === 3
          ? "待复核"
          : "未开始",
    rewrite: activeNode === 4 ? "待确认 Checklist" : round > 2 ? "已完成 2 次" : "未发起",
    final: finalConfirmed ? "通过" : activeNode === 4 ? "需重写" : "待终审",
    time: finalConfirmed ? "2026-09-08 10:06" : "—",
    round,
    activeNode,
    finalConfirmed,
    finalScore,
    ruleCount: 75,
    executedRules: activeNode < 0 ? 0 : activeNode === 0 ? 32 : 75,
    reviewReady: activeNode >= 2,
    verificationReady,
    reviewer: finalConfirmed ? "Emma Li" : "待确认",
    rewriteCount: round > 2 ? 2 : activeNode === 4 ? 1 : 0,
    summary:
      activeNode === 4
        ? "人工评分低于通过门槛，需确认重写建议后生成新版本。"
        : finalConfirmed
          ? "已完成人工最终确认，可查阅完整报告。"
          : "请结合原文证据逐项检查；AI 初始结果保留，人工拥有最终决定权。",
    scores: dimensions.map((label, i) => ({
      label,
      ai: activeNode < 2 || i === 3 ? null : [3.9, 4.0, 4.5, 0, 4.1][i],
      human:
        finalScore === null
          ? null
          : (id === "D049"
              ? [3.5, 3.7, 4.0, 3.7, 3.9]
              : id === "D031"
                ? [4.5, 4.6, 4.7, 4.2, 4.5]
                : [4.3, 4.3, 4.3, 4.3, 4.3])[i],
    })),
    issues,
    nodes: stages.map((name, i) => {
      const skipped = i === 4 && finalConfirmed && round === 1;
      const done = (i < activeNode || finalConfirmed) && !skipped;
      const current = i === activeNode && !finalConfirmed;
      return {
        name,
        state: skipped ? "无需重写" : done ? "已完成" : current ? "进行中" : "未开始",
        tone: (done ? "green" : current ? "purple" : "neutral") as Tone,
        started: done || current ? "09-08 10:0" + i : "—",
        finished: done ? "09-08 10:0" + (i + 1) : "—",
        input: inputs[i],
        output: done ? outputs[i] : "尚未产生",
        executor: owners[i],
        retry: 0,
        error: "无",
        log: skipped
          ? "本轮无需重写。"
          : done
            ? id + " · " + name + "完成，演示记录可追溯。"
            : current
              ? id + " · 等待" + owners[i] + "处理。"
              : "前置节点完成后启动，当前没有执行结果。",
      };
    }),
    markdown:
      "# " +
      name +
      "\n\n## 适用范围\n" +
      (id === "D042"
        ? "本文适用于 RG650E 系列模块。"
        : "本文用于 " + product + " 产品线的技术文档演示。") +
      "\n\n## 操作步骤\n" +
      evidence +
      "\n\n## 验证与记录\n保留运行日志、文档版本和处理人信息。",
  };
});
export const systemSections = [
  [
    "系统运行状态",
    "服务与依赖",
    [
      ["前端展示", "本地演示可用"],
      ["业务服务", "未连接 · 独立启动"],
      ["数据库", "待接入 PostgreSQL"],
      ["通知渠道", "未连接"],
    ],
  ],
  [
    "文档元数据",
    "文档归属与版本",
    [
      ["产品线", "5G / LTE / GNSS / LPWA"],
      ["文档版本", "每次提交独立保存"],
      ["定位方式", "稳定内容块编号"],
      ["导入来源", "本地文件 / 飞书知识库"],
    ],
  ],
  [
    "人员与角色",
    "角色与人工门禁",
    [
      ["管理员", "系统配置与权限"],
      ["审核员", "逐项确认及评分"],
      ["文档作者", "修改与提交版本"],
      ["发布人员", "最终发布确认"],
    ],
  ],
  [
    "大模型与智能体",
    "模型和提示词版本",
    [
      ["模型网关", "待配置"],
      ["初审策略", "规则执行后查漏补缺"],
      ["复审策略", "对固定报告逐项校验"],
      ["文档输入", "作为不可信数据处理"],
    ],
  ],
  [
    "审核规则与固定脚本",
    "集中管理规则和评分",
    [
      ["规则目录", "75 条 · 待业务验收"],
      ["报告生成", "固定脚本"],
      ["评分策略", "来自版本化契约"],
      ["内容差异性", "人工最终评分"],
    ],
  ],
  [
    "AI 自校验与执行一致性",
    "证据、定位和异常处理",
    [
      ["复审结果", "Pass / Fail / New / Summary"],
      ["初审结果", "保持原始记录"],
      ["无证据结论", "不得自动通过"],
      ["超时及失败", "保留原因并阻止流转"],
    ],
  ],
  [
    "系统操作及审核流程日志",
    "审计记录与追溯",
    [
      ["审计范围", "系统 / AI / 人工 / 脚本"],
      ["关联标识", "文档、版本、运行编号"],
      ["原始证据", "定位至文档内容块"],
      ["导出格式", "本地演示 JSON"],
    ],
  ],
] as const;
export const auditLogs = documents.flatMap((doc) =>
  doc.nodes
    .filter((n) => n.state === "已完成")
    .map((node, i) => ({
      id: doc.id + "-" + i,
      documentId: doc.id,
      time: "2026-" + node.finished,
      action: node.name,
      detail: node.log,
      actor: node.executor,
      status: "成功",
    })),
);
export const qualityTrend = [
  { month: "4月", score: 19.2, excellent: 8 },
  { month: "5月", score: 20.0, excellent: 11 },
  { month: "6月", score: 20.5, excellent: 13 },
  { month: "7月", score: 21.2, excellent: 17 },
  { month: "8月", score: 21.8, excellent: 20 },
  { month: "9月", score: 22.1, excellent: 23 },
];
