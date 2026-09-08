import { useState } from "react";
import { platformApi } from "../adapters/platform";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { useHash } from "../lib/navigation";
import { downloadJson } from "../lib/download";
import type { DocumentRecord } from "../domain/platform";
import { ManualReviewPanel } from "../components/ManualReviewPanel";
export function ReviewPage() {
  const hash = useHash(),
    id =
      new URLSearchParams(hash.split("?")[1] || "").get("document_id") ||
      platformApi.getDocuments()[0].id;
  const doc = platformApi.getDocument(id);
  const [search, setSearch] = useState("");
  return (
    <div className="review-layout">
      <aside className="queue">
        <div className="queue-heading">
          <h3>审核队列</h3>
          <Badge>{platformApi.getDocuments().length}</Badge>
        </div>
        <input
          aria-label="搜索审核队列"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索文档 / 编号"
        />
        {platformApi
          .getDocuments()
          .filter((d) => (d.name + d.id).toLowerCase().includes(search.toLowerCase()))
          .map((d) => (
            <button
              key={d.id}
              className={d.id === id ? "active" : ""}
              onClick={() => {
                location.hash = "#/review?document_id=" + d.id;
              }}
            >
              <span className="queue-meta">
                {d.id}
                <Badge tone={d.tone}>{d.statusLabel}</Badge>
              </span>
              <b>{d.name}</b>
              <small>
                {d.product} · {d.author} · 第 {d.round} 轮
              </small>
            </button>
          ))}
      </aside>
      {doc ? (
        <ReviewDetail key={doc.id} doc={doc} />
      ) : (
        <Card title="未找到文档">
          <div className="empty">文档编号不存在，请从左侧选择有效任务。</div>
        </Card>
      )}
    </div>
  );
}
function ReviewDetail({ doc }: { doc: DocumentRecord }) {
  const [selected, setSelected] = useState(Math.max(0, doc.activeNode)),
    [tab, setTab] = useState("verification"),
    [result, setResult] = useState("ALL");
  const node = doc.nodes[selected],
    issues = doc.issues.filter((i) =>
      tab === "report" ? i.result !== "New" : result === "ALL" || i.result === result,
    );
  const available = tab === "verification" ? doc.verificationReady : doc.reviewReady;
  return (
    <section className="workbench">
      <div className="work-head">
        <div>
          <div className="eyebrow">
            {doc.product} / {doc.id} / V{doc.round}.0
          </div>
          <h2>{doc.name}</h2>
          <p>
            {doc.author} · 更新于 {doc.updated}
          </p>
        </div>
        <Badge tone={doc.tone}>{doc.statusLabel}</Badge>
      </div>
      <div className="workflow">
        {doc.nodes.map((n, i) => (
          <button
            key={n.name}
            aria-pressed={selected === i}
            className={selected === i ? "selected" : ""}
            onClick={() => {
              setSelected(i);
              if (i === 3) setTab("manual");
            }}
          >
            <b className={n.tone}>{String(i + 1).padStart(2, "0")}</b>
            <span>
              {n.name}
              <small>{n.state}</small>
            </span>
          </button>
        ))}
      </div>
      <div className="node-panel">
        <div className="node-title">
          <strong>{node.name}</strong>
          <Badge tone={node.tone}>{node.state}</Badge>
          <span>{node.executor}</span>
        </div>
        <div className="node-detail">
          <span>
            开始时间<b>{node.started}</b>
          </span>
          <span>
            结束时间<b>{node.finished}</b>
          </span>
          <span>
            输入<b>{node.input}</b>
          </span>
          <span>
            输出<b>{node.output}</b>
          </span>
        </div>
        <details>
          <summary>执行日志与重试记录</summary>
          <p>{node.log}</p>
          <p>
            错误：{node.error} · 重试次数：{node.retry}
          </p>
        </details>
      </div>
      <div className="review-tabs" role="tablist" aria-label="审核详情">
        {[
          ["verification", "AI 自校验"],
          ["report", "固定报告"],
          ["scores", "五维评分"],
          ["manual", "人工复核与打分"],
          ["source", "原文预览"],
        ].map(([key, label]) => (
          <button
            role="tab"
            aria-selected={tab === key}
            key={key}
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tab === "manual" ? (
          <ManualReviewPanel key={doc.id} doc={doc} />
        ) : tab === "source" ? (
          <Card title="标准文档原文">
            <div className="section-note">V{doc.round}.0 · 演示文档 · 可定位至内容块</div>
            <pre className="source-document">{doc.markdown}</pre>
          </Card>
        ) : tab === "scores" ? (
          <Card title="五维评分与人工最终决定">
            <div className="score-banner">
              <div>
                <span>{doc.finalScore === null ? "最终总分" : "人工确认分"}</span>
                <strong>
                  {doc.finalScore === null ? "待人工评分" : doc.finalScore}
                  <small>{doc.finalScore !== null ? "/ 25" : ""}</small>
                </strong>
              </div>
              <p>{doc.summary}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>审核维度</th>
                  <th>AI 初始分</th>
                  <th>人工分</th>
                  <th>评分进度</th>
                </tr>
              </thead>
              <tbody>
                {doc.scores.map((s) => (
                  <tr key={s.label}>
                    <td>{s.label}</td>
                    <td>{s.ai === null ? "待评分" : s.ai.toFixed(1)}</td>
                    <td>{s.human === null ? "未确认" : s.human.toFixed(1)}</td>
                    <td>
                      <div className="meter">
                        <i style={{ width: ((s.human ?? s.ai ?? 0) / 5) * 100 + "%" }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="callout">
              内容差异性由人工最终评分。初审与人工结果分开保留；当前演示不提交终审决定。
              <button onClick={() => setTab("manual")}>进入人工复核与打分 →</button>
            </div>
          </Card>
        ) : !available ? (
          <Card title={tab === "verification" ? "AI 自校验尚未开始" : "固定报告尚未生成"}>
            <div className="empty">
              <strong>前置节点尚未完成</strong>
              <p>
                当前执行 {doc.executedRules} / {doc.ruleCount} 条规则，结果产生后再展示。
              </p>
            </div>
          </Card>
        ) : (
          <>
            <div className="result-summary">
              <div>
                <span>{tab === "verification" ? "逐项复审" : "固定报告"}</span>
                <h3>
                  {tab === "verification" ? "保留初审，追加复审依据" : "证据与位置已关联原文"}
                </h3>
                <p>
                  {issues.length} 条示例问题 · {doc.executedRules}/{doc.ruleCount} 规则执行
                </p>
              </div>
              <button
                onClick={() =>
                  downloadJson(doc.id + "-demo-review.json", {
                    mode: "MOCK",
                    document: doc.id,
                    issues:
                      tab === "report"
                        ? doc.issues
                            .filter((i) => i.result !== "New")
                            .map((i) => ({
                              id: i.id,
                              dimension: i.dimension,
                              evidence: i.evidence,
                              block: i.block,
                            }))
                        : doc.issues,
                    initialScores: doc.scores.map((s) => ({ dimension: s.label, score: s.ai })),
                  })
                }
              >
                导出演示结果 ↓
              </button>
            </div>
            {tab === "verification" && (
              <section className="verification-cards">
                {(["Pass", "Fail", "New"] as const).map((r, i) => (
                  <button
                    key={r}
                    className={"verify-card " + ["pass", "fail", "new"][i]}
                    onClick={() => setResult(result === r ? "ALL" : r)}
                    aria-pressed={result === r}
                  >
                    <span>
                      {r} <small>{["确认初审", "建议修正", "复审新增"][i]}</small>
                    </span>
                    <b>{doc.issues.filter((x) => x.result === r).length}</b>
                  </button>
                ))}
              </section>
            )}
            <div className="evidence-layout">
              <Card title="问题与复审依据">
                <div className="issue-filter">
                  <span>
                    {tab === "report"
                      ? "初审问题"
                      : result === "ALL"
                        ? "全部问题"
                        : result + " 问题"}{" "}
                    · {issues.length} 项
                  </span>
                  <button className="text-button" onClick={() => setResult("ALL")}>
                    显示全部
                  </button>
                </div>
                {issues.map((issue) => (
                  <article className="issue-card" key={issue.id}>
                    <div>
                      <Badge
                        tone={
                          tab === "report"
                            ? "neutral"
                            : issue.result === "Pass"
                              ? "green"
                              : issue.result === "Fail"
                                ? "red"
                                : "amber"
                        }
                      >
                        {tab === "report" ? "初审记录" : issue.result}
                      </Badge>
                      <span>{issue.dimension}</span>
                      <small>{issue.id}</small>
                    </div>
                    <h4>
                      {tab === "report" ? (issue.initialProblem ?? issue.problem) : issue.problem}
                    </h4>
                    <blockquote>{issue.evidence}</blockquote>
                    <p>
                      {tab === "report"
                        ? (issue.initialSuggestion ?? issue.suggestion)
                        : issue.suggestion}
                    </p>
                    <span className="block-location">{issue.block}</span>
                  </article>
                ))}
                {!issues.length && <div className="empty">当前分类没有问题</div>}
              </Card>
              <aside>
                <Card title="Summary · 复审汇总">
                  <dl className="summary-list">
                    <div>
                      <dt>初审问题</dt>
                      <dd>{doc.issues.filter((i) => i.result !== "New").length}</dd>
                    </div>
                    <div>
                      <dt>复审新增</dt>
                      <dd>{doc.issues.filter((i) => i.result === "New").length}</dd>
                    </div>
                    <div>
                      <dt>结果来源</dt>
                      <dd>脱敏演示</dd>
                    </div>
                    <div>
                      <dt>人工最终分</dt>
                      <dd>{doc.finalScore ?? "待人工评分"}</dd>
                    </div>
                  </dl>
                  <div className="callout">{doc.summary}</div>
                  <button className="wide" onClick={() => setTab("source")}>
                    对照文档原文 →
                  </button>
                  <button className="wide" onClick={() => setTab("scores")}>
                    查看五维评分 →
                  </button>
                </Card>
              </aside>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
