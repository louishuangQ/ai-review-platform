import { useState } from "react";
import type { DocumentRecord } from "../domain/platform";
import { scoringPolicy, previewScore } from "../adapters/operations";
import { downloadJson } from "../lib/download";
import { Card } from "./Card";

/** Human review drafts never modify initial findings or claim a backend final decision. */
export function ManualReviewPanel({ doc }: { doc: DocumentRecord }) {
  const [scores, setScores] = useState(doc.scores.map((s) => s.human?.toString() ?? ""));
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [reason, setReason] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState("");
  const total = previewScore(scores);
  const rewrite =
    total !== null &&
    (total < scoringPolicy.rewriteBelow || Object.values(decisions).includes("REWRITE"));
  const eligible = doc.verificationReady && !doc.finalConfirmed;
  function exportDraft() {
    if (!eligible) return;
    if (
      total === null ||
      !reviewer.trim() ||
      !reason.trim() ||
      !confirmed ||
      doc.issues.some(
        (i) => !decisions[i.id] || (decisions[i.id] !== "CONFIRM" && !comments[i.id]?.trim()),
      )
    ) {
      setMessage("请逐项确认问题、填写五维评分、审核人和审核依据，并勾选原文确认。");
      return;
    }
    downloadJson(doc.id + "-manual-draft.json", {
      mode: "MOCK_DRAFT",
      document_id: doc.id,
      document_version: doc.round,
      reviewer,
      policy: scoringPolicy.version,
      initial_scores: doc.scores.map((s) => ({ dimension: s.label, score: s.ai })),
      human_scores: scores.map(Number),
      preview_total: total,
      proposed_decision: rewrite ? "REWRITE_REQUIRED" : "APPROVED",
      decisions,
      comments,
      reason,
      created_at: new Date().toISOString(),
    });
    setMessage("复核草稿已导出。未提交业务服务、未改变文档状态；正式确认需要服务端门禁和审计。");
  }
  return (
    <Card title="人工复核工作台">
      <div className="callout">
        1 对照原文 → 2 逐项裁决 → 3 五维评分 → 4 确认结论。当前为本地草稿，不覆盖 AI
        或已有人工结果。
      </div>
      {!eligible && (
        <p role="status">
          {doc.finalConfirmed
            ? "此版本已终审，人工结果只读；修改需发起新版本。"
            : "AI 自校验尚未完成，不能提交人工复核。"}
        </p>
      )}
      <fieldset disabled={!eligible} className="operations-form">
        {doc.issues.map((i) => (
          <div className="issue-card" key={i.id}>
            <h4>
              {i.id} · {i.problem}
            </h4>
            <blockquote>{i.evidence}</blockquote>
            <small>
              {i.block} · AI 复审：{i.result}
            </small>
            <label>
              逐项裁决
              <select
                aria-label={i.id + "裁决"}
                value={decisions[i.id] || ""}
                onChange={(e) => setDecisions({ ...decisions, [i.id]: e.target.value })}
              >
                <option value="">待人工处理</option>
                <option value="CONFIRM">确认判断</option>
                <option value="CORRECT">修正判断</option>
                <option value="REWRITE">要求重写</option>
              </select>
            </label>
            <label>
              修正或重写依据
              <textarea
                value={comments[i.id] || ""}
                onChange={(e) => setComments({ ...comments, [i.id]: e.target.value })}
              />
            </label>
          </div>
        ))}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>维度 / 权重</th>
                <th>AI 初始分（保留）</th>
                <th>人工评分 1–5</th>
              </tr>
            </thead>
            <tbody>
              {doc.scores.map((s, i) => (
                <tr key={s.label}>
                  <td>
                    {s.label} / {scoringPolicy.weights[i]}
                  </td>
                  <td>{s.ai ?? "仅人工评分"}</td>
                  <td>
                    <input
                      aria-label={s.label + "人工评分"}
                      type="number"
                      min={scoringPolicy.min}
                      max={scoringPolicy.max}
                      step="0.1"
                      value={scores[i]}
                      onChange={(e) =>
                        setScores(scores.map((v, j) => (j === i ? e.target.value : v)))
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="score-banner">
          <strong>{total === null ? "待完整评分" : total + " / 25"}</strong>
          <span>
            {total === null
              ? "缺失任一维度时不生成总分"
              : rewrite
                ? "建议进入重写流程"
                : "具备优秀候选资格，仍需正式人工确认"}
          </span>
        </div>
        <small>
          预览公式：加权得分 × 25 ÷ 25.5，保留 1 位小数；低于 20
          分不能通过。正式结果以人工服务计算为准。
        </small>
        <label>
          审核人
          <input value={reviewer} onChange={(e) => setReviewer(e.target.value)} />
        </label>
        <label>
          审核依据 / 重写建议
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
        <label className="checkbox-line">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          已核对原文、复审证据和本版本评分
        </label>
        <button className="primary" onClick={exportDraft}>
          校验并导出复核草稿
        </button>
      </fieldset>
      <p role="status">{message}</p>
    </Card>
  );
}
