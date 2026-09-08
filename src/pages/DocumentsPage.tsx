import { useState } from "react";
import { platformApi } from "../adapters/platform";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { useHash } from "../lib/navigation";
import type { Navigate } from "../types";
export function DocumentsPage({ go }: { go: Navigate }) {
  const hash = useHash(),
    query = new URLSearchParams(hash.split("?")[1] || "");
  const status = query.get("status") || "ALL";
  const [search, setSearch] = useState(""),
    [product, setProduct] = useState("ALL"),
    [preview, setPreview] = useState<string | null>(null);
  const all = platformApi.getDocuments(),
    filters = platformApi.getFilters();
  const rows = all.filter(
    (d) =>
      (status === "ALL" || d.workflowStatus === status) &&
      (product === "ALL" || d.product === product) &&
      [d.name, d.id, d.author].join(" ").toLowerCase().includes(search.trim().toLowerCase()),
  );
  const document = preview ? platformApi.getDocument(preview) : undefined;
  return (
    <>
      <div className="filter-tabs" aria-label="文档状态">
        {filters.map((f) => (
          <button
            className={status === f.value ? "active" : ""}
            key={f.value}
            onClick={() => go("documents", f.value === "ALL" ? "" : "?status=" + f.value)}
          >
            {f.label}
            <span>
              {all.filter((d) => f.value === "ALL" || d.workflowStatus === f.value).length}
            </span>
          </button>
        ))}
      </div>
      <Card title="文档库">
        <div className="toolbar">
          <input
            aria-label="搜索文档"
            placeholder="搜索文档名称、编号或作者"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            aria-label="产品线筛选"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          >
            <option value="ALL">全部产品线</option>
            {[...new Set(all.map((d) => d.product))].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select
            aria-label="状态筛选"
            value={status}
            onChange={(e) => go("documents", "?status=" + e.target.value)}
          >
            {filters.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearch("");
              setProduct("ALL");
              go("documents");
            }}
          >
            重置
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {[
                  "文档名称 / 版本",
                  "来源 / 产品线",
                  "预览校验",
                  "AI 审核",
                  "人工复核",
                  "重写状态",
                  "最终结果 / 时间",
                  "操作",
                ].map((t) => (
                  <th key={t}>{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id}>
                  <td className="document-name">
                    <button className="text-button" onClick={() => setPreview(d.id)}>
                      {d.name}
                    </button>
                    <small>
                      {d.id} · V{d.round}.0 · {d.author}
                    </small>
                  </td>
                  <td>
                    {d.source}
                    <small>{d.product}</small>
                  </td>
                  <td>{d.preview}</td>
                  <td>{d.ai}</td>
                  <td>{d.human}</td>
                  <td>{d.rewrite}</td>
                  <td>
                    <Badge tone={d.tone}>{d.final}</Badge>
                    <small>{d.time}</small>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => setPreview(d.id)}>预览</button>
                      <button
                        className="text-button"
                        onClick={() =>
                          go(d.finalConfirmed ? "reports" : "review", "?document_id=" + d.id)
                        }
                      >
                        {d.finalConfirmed ? "查看报告" : "进入审核"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <div className="empty">
            <strong>没有符合当前筛选条件的文档</strong>
            <p>试试其他关键词或重置筛选。</p>
          </div>
        )}
        <div className="card-foot">
          显示 {rows.length} / {all.length} 份文档 <span>本地演示数据</span>
        </div>
      </Card>
      <div className="capability-note">
        <b>接入能力</b>
        <span>本地文件上传和飞书导入已规划独立服务；当前可预览样本文档、查看审核流程。</span>
      </div>
      {document && (
        <Modal title={document.name} onClose={() => setPreview(null)}>
          <div className="preview-meta">
            <Badge tone={document.tone}>{document.statusLabel}</Badge>
            <span>
              {document.id} · V{document.round}.0 · {document.product}
            </span>
          </div>
          <pre className="source-document">{document.markdown}</pre>
          <div className="modal-footer">
            <span>脱敏样本 · 不会上传文件</span>
            <button
              className="primary"
              onClick={() => {
                setPreview(null);
                go("review", "?document_id=" + document.id);
              }}
            >
              查看审核详情 →
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
