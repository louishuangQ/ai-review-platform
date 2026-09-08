// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ManualReviewPanel } from "./components/ManualReviewPanel";
import { ConnectionSettings } from "./components/ConnectionSettings";
import { PeriodResults } from "./components/PeriodResults";
import { platformApi } from "./adapters/platform";
import {
  loadConfiguration,
  previewScore,
  saveConfiguration,
  validateConfiguration,
} from "./adapters/operations";
afterEach(() => {
  cleanup();
  localStorage.clear();
});
describe("operations local-only gates", () => {
  it("calculates weighted score and rejects missing, out-of-range or NaN scores", () => {
    expect(previewScore(["5", "5", "5", "5", "5"])).toBe(25);
    expect(previewScore(["4", "4", "4", "4", "4"])).toBe(20);
    for (const invalid of ["", "0", "6", "NaN"])
      expect(previewScore([invalid, "4", "4", "4", "4"])).toBeNull();
  });
  it("does not mutate original scores while editing a human draft", () => {
    const doc = platformApi.getDocument("D042")!;
    const original = JSON.stringify(doc);
    render(<ManualReviewPanel doc={doc} />);
    for (const s of doc.scores)
      fireEvent.change(screen.getByLabelText(s.label + "人工评分"), { target: { value: "3" } });
    expect(screen.getByText("15 / 25")).toBeTruthy();
    expect(screen.getByText("建议进入重写流程")).toBeTruthy();
    expect(JSON.stringify(doc)).toBe(original);
  });
  it("requires item decisions and human evidence before export", () => {
    render(<ManualReviewPanel doc={platformApi.getDocument("D042")!} />);
    fireEvent.click(screen.getByText("校验并导出复核草稿"));
    expect(screen.getByText(/请逐项确认问题/)).toBeTruthy();
  });
  it.each(["D043", "D031"])("locks review before verification or after finalization %s", (id) => {
    render(<ManualReviewPanel doc={platformApi.getDocument(id)!} />);
    expect(screen.getByRole("group").hasAttribute("disabled")).toBe(true);
  });
  it("persists only a non-secret local configuration draft", () => {
    const c = loadConfiguration();
    c.services[0].url = "http://127.0.0.1:9020";
    c.credentialRef = "env:FEISHU_APP_SECRET";
    saveConfiguration(c);
    expect(loadConfiguration().services[0].url).toBe(c.services[0].url);
  });
  it("rejects credentials in URL and non-reference secrets", () => {
    const c = loadConfiguration();
    c.services[0].url = "https://user:password@example.com";
    expect(validateConfiguration(c)).not.toBe("");
    c.services[0].url = "http://localhost:8920";
    c.credentialRef = "example-not-a-reference";
    expect(validateConfiguration(c)).not.toBe("");
  });
  it("checks wiki space and time window", () => {
    const c = loadConfiguration();
    c.spaceId = "node_token";
    expect(validateConfiguration(c)).not.toBe("");
    c.spaceId = "";
    c.windowStart = "12:00";
    expect(validateConfiguration(c)).not.toBe("");
  });
  it("saves configuration without claiming connectivity or scheduler activation", () => {
    render(<ConnectionSettings section="services" />);
    fireEvent.click(screen.getByText("校验并保存配置草稿"));
    expect(screen.getByText(/配置草稿已保存在当前浏览器/)).toBeTruthy();
  });
  it("filters inclusive batch dates and handles reversed ranges", () => {
    render(<PeriodResults />);
    fireEvent.change(screen.getByLabelText("开始日期"), { target: { value: "2026-09-08" } });
    expect(screen.queryByText("B0907")).toBeNull();
    expect(screen.getByText("B0908")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("开始日期"), { target: { value: "2026-09-09" } });
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.queryByText("B0908")).toBeNull();
  });
});
