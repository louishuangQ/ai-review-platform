import { platformApi } from "../adapters/platform";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import type { Navigate } from "../types";
export function OverviewPage({ go }: { go: Navigate }) {
  const data = platformApi.getDashboard(),
    docs = platformApi.getDocuments(),
    trend = platformApi.getTrend();
  return (
    <>
      <section className="overview-intro">
        <div>
          <span className="eyebrow">YOUR REVIEW WORKSPACE</span>
          <h2>
            让每一份技术文档，
            <br />
            都经得起验证。
          </h2>
          <p>从接入到终审，所有证据与决策在同一条流程中清晰呈现。</p>
          <button onClick={() => go("review", "?document_id=D042")}>
            继续处理待复核文档 <span>→</span>
          </button>
        </div>
        <div className="intro-stats">
          <span>当前样本库</span>
          <strong>
            {data.total}
            <small>份文档</small>
          </strong>
          <div className="intro-stat-bottom">
            <span>
              已闭环 <b>{data.complete}</b>
            </span>
            <span>
              待人工处理 <b>{data.attention}</b>
            </span>
          </div>
        </div>
      </section>
      <section className="metric-grid five">
        {data.cards.map((c, i) => (
          <button
            key={c.value}
            className={"metric metric-" + c.tone}
            onClick={() =>
              go(
                c.value === "FINAL_APPROVED" ? "reports" : "documents",
                c.value === "FINAL_APPROVED" ? "" : "?status=" + c.value,
              )
            }
          >
            <div className="metric-title">
              <span>{c.label}</span>
              <span className="metric-index">0{i + 1}</span>
            </div>
            <b>{c.count.toString().padStart(2, "0")}</b>
            <small>
              查看对应文档 <span>↗</span>
            </small>
          </button>
        ))}
      </section>
      <section className="overview-grid">
        <Card title="优先处理">
          <div className="section-note">待人工介入的示例文档 · 共 {data.attention} 项</div>
          <div className="todo-list">
            {docs
              .filter((d) => d.verificationReady && !d.finalConfirmed)
              .map((d) => (
                <button key={d.id} onClick={() => go("review", "?document_id=" + d.id)}>
                  <span className={"doc-monogram " + d.tone}>{d.product}</span>
                  <span className="todo-copy">
                    <b>{d.name}</b>
                    <small>
                      {d.id} · {d.author} · 第 {d.round} 轮
                    </small>
                  </span>
                  <Badge tone={d.tone}>{d.statusLabel}</Badge>
                  <span>→</span>
                </button>
              ))}
          </div>
        </Card>
        <Card title="审核任务分布">
          <div className="section-note">与当前文档列表实时一致</div>
          <div className="distribution">
            {data.cards.map((c) => (
              <button key={c.value} onClick={() => go("documents", "?status=" + c.value)}>
                <span>{c.label}</span>
                <div className="meter">
                  <i className={c.tone} style={{ width: (100 * c.count) / data.total + "%" }} />
                </div>
                <b>{c.count}</b>
              </button>
            ))}
          </div>
          <div className="card-foot">
            全部 {data.total} 份示例文档 · 已终审 {data.complete} 份
          </div>
        </Card>
      </section>
      <section className="grid-two">
        <Card title="文档质量趋势">
          <div className="section-note">历史演示序列 · 全产品线 · 25 分制</div>
          <div className="chart-bars">
            {trend.map((t) => (
              <div key={t.month}>
                <b>{t.score}</b>
                <div className="chart-track">
                  <i style={{ height: (t.score / 25) * 100 + "%" }} />
                </div>
                <small>{t.month}</small>
              </div>
            ))}
          </div>
        </Card>
        <Card title="月度优秀文档">
          <div className="section-note">历史演示序列 · 人工终审通过的优秀文档</div>
          <div className="chart-bars secondary">
            {trend.map((t) => (
              <div key={t.month}>
                <b>{t.excellent}</b>
                <div className="chart-track">
                  <i style={{ height: (t.excellent / 25) * 100 + "%" }} />
                </div>
                <small>{t.month}</small>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}
