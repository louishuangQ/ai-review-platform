export type Route = "overview" | "documents" | "review" | "reports" | "system" | "logs";

export type Navigate = (route: Route, query?: string) => void;

export const routes: Array<[Route, string, string]> = [
  ["overview", "01", "审核总览"],
  ["documents", "02", "文档中心"],
  ["review", "03", "智能审核"],
  ["reports", "04", "审核报告"],
  ["system", "05", "系统管理"],
  ["logs", "06", "操作日志"],
];
