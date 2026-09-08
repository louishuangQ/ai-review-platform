import { useState } from "react";
import { batchSamples } from "../adapters/operations";
import { platformApi } from "../adapters/platform";
import { Card } from "./Card";
import { downloadJson } from "../lib/download";
/** Batch stage counts overlap; never sum them as mutually exclusive outcomes. */
export function PeriodResults() {
  const [start, setStart] = useState("2026-09-01"),
    [end, setEnd] = useState("2026-09-08");
  const valid = !!start && !!end && start <= end;
  const rows = valid
    ? batchSamples.filter((b) => b.start.slice(0, 10) >= start && b.start.slice(0, 10) <= end)
    : [];
  const ids = new Set(rows.flatMap((b) => b.docs));
  const docs = platformApi.getDocuments().filter((d) => ids.has(d.id));
  const sum = (key: "found" | "unchanged" | "review" | "verify" | "failed") =>
    rows.reduce((s, b) => s + b[key], 0);
  return (
    <Card title="时间段审核总结果">
      <div className="toolbar">
        <label>
          开始日期
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label>
          结束日期
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <button
          disabled={!valid || !rows.length}
          onClick={() =>
            downloadJson("period-results-demo.json", {
              mode: "MOCK",
              timezone: "Asia/Shanghai",
              start,
              end,
              batches: rows,
              documents: docs,
            })
          }
        >
          导出时间段结果
        </button>
      </div>
      {!valid && <p role="alert">请选择有效时间段，开始日期不能晚于结束日期。</p>}
      <p>
        脱敏批次样本 · 按批次启动日期统计，Asia/Shanghai，包含结束当天。AI
        阶段计数可重叠，不代表人工批准。
      </p>
      <div className="metric-grid three">
        {[
          ["扫描文档", sum("found")],
          ["跳过未变化", sum("unchanged")],
          ["AI 初审完成", sum("review")],
          ["AI 自校验完成", sum("verify")],
          ["执行失败", sum("failed")],
          ["关联文档", docs.length],
        ].map(([label, value]) => (
          <div className="metric" key={label}>
            <span>{label}</span>
            <b>{value}</b>
          </div>
        ))}
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>批次</th>
              <th>时间段</th>
              <th>来源</th>
              <th>AI 初审 / 自校验</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>
                  {b.start} → {b.end}
                </td>
                <td>{b.source}</td>
                <td>
                  {b.review} / {b.verify}
                </td>
                <td>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <div className="empty">此时间段没有演示批次，不代表真实知识库没有新文档。</div>
      )}
      <h3>关联文档当前结果</h3>
      <p>下列为当前状态快照，不是所选时间段的历史终审数。最终报告仍仅收录已人工确认的文档。</p>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>文档</th>
              <th>当前结果</th>
              <th>最终确认分</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id}>
                <td>
                  <a href={"#/review?document_id=" + d.id}>{d.name}</a>
                </td>
                <td>{d.statusLabel}</td>
                <td>{d.finalConfirmed ? d.finalScore : "未最终确认"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
