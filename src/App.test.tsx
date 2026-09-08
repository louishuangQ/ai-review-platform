// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "./App";
import { platformApi } from "./adapters/platform";
afterEach(cleanup);
function mount(hash: string) {
  window.history.replaceState(null, "", hash);
  return render(<App />);
}
function navigate(hash: string) {
  act(() => {
    window.history.replaceState(null, "", hash);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
}
describe("local demonstration user journeys", () => {
  it("keeps the six original modules", () => {
    mount("#/overview");
    for (const label of ["审核总览", "文档中心", "智能审核", "审核报告", "系统管理", "操作日志"])
      expect(
        within(screen.getByRole("navigation")).getByRole("button", { name: new RegExp(label) }),
      ).toBeTruthy();
  });
  it("dashboard counts reconcile with the document list", () => {
    const dashboard = platformApi.getDashboard();
    expect(dashboard.cards.reduce((sum, c) => sum + c.count, 0)).toBe(dashboard.total);
    expect(dashboard.complete).toBe(
      platformApi.getDocuments().filter((d) => d.finalConfirmed).length,
    );
  });
  it("filters by status and author as well as document name", () => {
    mount("#/documents?status=REWRITE_REQUIRED");
    expect(screen.getByRole("button", { name: "RM520N 固件恢复操作手册" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "RG650E AT 命令故障排查指南" })).toBeNull();
    fireEvent.change(screen.getByLabelText("搜索文档"), { target: { value: "周宁" } });
    expect(screen.getByRole("button", { name: "RM520N 固件恢复操作手册" })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("搜索文档"), { target: { value: "不存在的文档" } });
    expect(screen.getByText("没有符合当前筛选条件的文档")).toBeTruthy();
  });
  it("reacts to same-page query changes such as browser back", () => {
    mount("#/documents?status=REWRITE_REQUIRED");
    navigate("#/documents?status=WAITING_MANUAL_REVIEW");
    expect(screen.getByRole("button", { name: "RG650E AT 命令故障排查指南" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "RM520N 固件恢复操作手册" })).toBeNull();
  });
  it("supports deep links to completed document instead of replacing it with D042", () => {
    mount("#/review?document_id=D031");
    expect(screen.getByRole("heading", { name: "EG915U 固件升级最佳实践" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "RG650E AT 命令故障排查指南" })).toBeNull();
  });
  it("does not invent a document for invalid IDs", () => {
    mount("#/review?document_id=UNKNOWN");
    expect(screen.getByRole("heading", { name: "未找到文档" })).toBeTruthy();
  });
  it("does not display verification results before verification has executed", () => {
    mount("#/review?document_id=D043");
    expect(screen.getByRole("heading", { name: "AI 自校验尚未开始" })).toBeTruthy();
    expect(screen.queryByText("Pass")).toBeNull();
  });
  it("preserves pending human scoring and resets selected node on task change", () => {
    mount("#/review?document_id=D042");
    expect(screen.getByText("待人工评分")).toBeTruthy();
    fireEvent.click(screen.getByRole("tab", { name: "原文预览" }));
    navigate("#/review?document_id=D049");
    expect(screen.getByRole("heading", { name: "RM520N 固件恢复操作手册" })).toBeTruthy();
    expect(screen.getByText("18.7")).toBeTruthy();
    expect(screen.getByRole("tab", { name: "AI 自校验" }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });
  it("preserves initial findings and excludes verification additions from the fixed report", () => {
    mount("#/review?document_id=D042");
    fireEvent.click(screen.getByRole("tab", { name: "固定报告" }));
    expect(screen.queryByRole("heading", { name: "复审新增：缺少适用固件版本范围" })).toBeNull();
    expect(
      screen.getByRole("heading", { name: "初审判定：产品型号存在拼写问题（保留待复核）" }),
    ).toBeTruthy();
  });
  it("lists only final human-approved reports", () => {
    mount("#/reports");
    expect(screen.getByRole("heading", { name: "EG915U 固件升级最佳实践" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "RM520N 固件恢复操作手册" })).toBeNull();
  });
  it("filters audit records by document rather than showing unrelated logs", () => {
    mount("#/logs");
    fireEvent.change(screen.getByLabelText("搜索日志"), { target: { value: "D031" } });
    const links = screen.getAllByRole("link", { name: "D031" });
    expect(links.length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "D042" })).toBeNull();
  });
});
