/** Local-only adapters. No network, credential storage or real scheduler is hidden here. */
export const scoringPolicy = {
  version: "v1.2-demo",
  weights: [1.3, 1.2, 1, 0.8, 0.8],
  min: 1,
  max: 5,
  rewriteBelow: 20,
};
export function previewScore(scores: string[]) {
  if (
    scores.length !== scoringPolicy.weights.length ||
    scores.some(
      (s) =>
        !s.trim() ||
        !Number.isFinite(Number(s)) ||
        Number(s) < scoringPolicy.min ||
        Number(s) > scoringPolicy.max,
    )
  )
    return null;
  return (
    Math.round(
      ((scores.reduce((sum, s, i) => sum + Number(s) * scoringPolicy.weights[i], 0) * 25) / 25.5 +
        Number.EPSILON) *
        10,
    ) / 10
  );
}
export const serviceDefaults = [
  { name: "AI 初审", url: "http://127.0.0.1:8920", path: "/api/v1/health" },
  { name: "固定报告", url: "http://127.0.0.1:8921", path: "/health" },
  { name: "AI 自校验", url: "http://127.0.0.1:8900", path: "/health" },
  { name: "人工复核", url: "http://127.0.0.1:8922", path: "/api/v1/health" },
  { name: "工作流编排", url: "http://127.0.0.1:8910", path: "/health" },
  { name: "知识库接入（待部署）", url: "", path: "/health" },
];
export const configurationDefaults = {
  services: serviceDefaults,
  wikiUrl: "",
  spaceId: "",
  appId: "",
  credentialRef: "",
  product: "5G",
  frequency: "daily",
  time: "09:00",
  weekday: "1",
  timezone: "Asia/Shanghai",
  windowStart: "08:00",
  windowEnd: "20:00",
  includeUpdated: true,
};
export type Configuration = typeof configurationDefaults;
export function validateConfiguration(value: Configuration) {
  for (const service of value.services) {
    if (!service.url && service.name.includes("待部署")) continue;
    try {
      const url = new URL(service.url);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.search ||
        url.hash
      )
        return "服务地址仅允许无用户名、密码及查询参数的 HTTP(S) 地址。";
    } catch {
      return service.name + "地址格式不正确。";
    }
  }
  if (value.wikiUrl) {
    try {
      const url = new URL(value.wikiUrl);
      if (
        url.protocol !== "https:" ||
        !url.pathname.startsWith("/wiki/") ||
        url.username ||
        url.password ||
        url.search ||
        url.hash
      )
        return "请填写不带查询参数的 HTTPS /wiki/ 知识库链接。";
    } catch {
      return "知识库链接格式错误。";
    }
  }
  if (value.spaceId && !/^\d+$/.test(value.spaceId))
    return "空间 ID 应为数字；知识库节点 Token 不能代替空间 ID。";
  if (value.credentialRef && !/^env:[A-Z][A-Z0-9_]{2,63}$/.test(value.credentialRef))
    return "凭证只能填写 env:FEISHU_APP_SECRET 形式的后端引用，不接收真实密钥。";
  if (value.appId && !/^cli_[a-zA-Z0-9]+$/.test(value.appId)) return "App ID 格式应为 cli_ 开头。";
  if (
    value.windowStart >= value.windowEnd ||
    value.time < value.windowStart ||
    value.time > value.windowEnd
  )
    return "运行时间需在当日执行窗口内；暂不支持跨午夜窗口。";
  return "";
}
export function saveConfiguration(value: Configuration) {
  const error = validateConfiguration(value);
  if (error) throw new Error(error);
  localStorage.setItem("ai-review:config:v1", JSON.stringify(value));
}
export function loadConfiguration(): Configuration {
  try {
    const value = JSON.parse(localStorage.getItem("ai-review:config:v1") || "null");
    if (
      value &&
      Array.isArray(value.services) &&
      typeof value.time === "string" &&
      !validateConfiguration(value)
    )
      return value;
  } catch {
    /* Invalid or inaccessible storage falls back to an unsaved draft. */
  }
  return structuredClone(configurationDefaults);
}
export const batchSamples = [
  {
    id: "B0908",
    start: "2026-09-08 09:00",
    end: "2026-09-08 09:18",
    source: "飞书知识库",
    found: 8,
    unchanged: 3,
    review: 3,
    verify: 2,
    failed: 1,
    status: "部分失败",
    docs: ["D042", "D043", "D054", "D053", "D052"],
  },
  {
    id: "B0907",
    start: "2026-09-07 09:00",
    end: "2026-09-07 09:12",
    source: "飞书知识库",
    found: 5,
    unchanged: 2,
    review: 3,
    verify: 3,
    failed: 0,
    status: "AI 阶段完成",
    docs: ["D031", "D028", "D049"],
  },
];
