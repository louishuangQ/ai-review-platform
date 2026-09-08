import { useState } from "react";
import { platformApi } from "../adapters/platform";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { downloadJson } from "../lib/download";
import { PeriodResults } from "../components/PeriodResults";
import { useHash } from "../lib/navigation";
export function ReportsPage() {
  const hash = useHash();
  const period = new URLSearchParams(hash.split("?")[1] || "").get("view") === "period";
  const [search, setSearch] = useState("");
  const all = platformApi.getDocuments().filter((d) => d.finalConfirmed);
  const rows = all.filter((d) =>
    (d.name + d.product + d.id).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="review-tabs">
        <a href="#/reports">最终人工确认报告</a>
        <a href="#/reports?view=period">时间段审核总结果</a>
      </div>
      {period ? (
        <PeriodResults />
      ) : (
        <>
          <section className="metric-grid three">
            <div className="metric">
              <span>人工最终确认</span>
              <b>{all.length}</b>
              <small>已进入最终报告库</small>
            </div>
            <div className="metric">
              <span>平均最终得分</span>
              <b>
                {(
                  all.reduce((s, d) => s + (d.finalScore ?? 0), 0) / Math.max(1, all.length)
                ).toFixed(1)}
                <small> / 25</small>
              </b>
              <small>仅统计人工确认结果</small>
            </div>
            <div className="metric">
              <span>累计重写</span>
              <b>{all.reduce((s, d) => s + d.rewriteCount, 0)}</b>
              <small>报告库文档重写次数</small>
            </div>
          </section>
          <Card title="最终审核报告">
            <div className="toolbar">
              <input
                aria-label="搜索报告"
                placeholder="搜索报告名称、编号或产品线"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                onClick={() =>
                  downloadJson("final-reports-demo.json", { mode: "MOCK", reports: rows })
                }
                disabled={!rows.length}
              >
                导出当前 {rows.length} 份报告 ↓
              </button>
            </div>
            <div className="reports-grid">
              {rows.map((d) => (
                <article className="report-card" key={d.id}>
                  <div>
                    <span className="eyebrow">
                      {d.product} / {d.id}
                    </span>
                    <Badge tone="green">人工终审通过</Badge>
                  </div>
                  <h3>{d.name}</h3>
                  <div className="report-score">
                    {d.finalScore}
                    <small>/25</small>
                  </div>
                  <dl>
                    <div>
                      <dt>审核人</dt>
                      <dd>{d.reviewer}</dd>
                    </div>
                    <div>
                      <dt>重写次数</dt>
                      <dd>{d.rewriteCount} 次</dd>
                    </div>
                    <div>
                      <dt>完成时间</dt>
                      <dd>{d.time}</dd>
                    </div>
                  </dl>
                  <button
                    className="wide"
                    onClick={() => {
                      location.hash = "#/review?document_id=" + d.id;
                    }}
                  >
                    查看完整流程 →
                  </button>
                </article>
              ))}
            </div>
            {!rows.length && <div className="empty">没有匹配的最终报告</div>}
          </Card>
        </>
      )}
    </>
  );
}
