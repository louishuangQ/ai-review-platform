import { useState } from "react";
import { platformApi } from "../adapters/platform";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { downloadJson } from "../lib/download";
export function LogsPage() {
  const [search, setSearch] = useState(""),
    [action, setAction] = useState("ALL");
  const all = platformApi.getAuditLogs(),
    rows = all.filter(
      (row) =>
        (action === "ALL" || row.action === action) &&
        [row.documentId, row.detail, row.actor]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
    );
  return (
    <Card title="系统操作及审核流程日志">
      <div className="toolbar">
        <input
          aria-label="搜索日志"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索文档编号、人员或操作内容"
        />
        <select aria-label="日志类型" value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="ALL">全部操作</option>
          {[...new Set(all.map((r) => r.action))].map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <button
          onClick={() => downloadJson("audit-log-demo.json", { mode: "MOCK", logs: rows })}
          disabled={!rows.length}
        >
          导出筛选日志 ↓
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {["发生时间", "文档", "节点 / 操作", "执行详情", "执行人", "结果"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.time}</td>
                <td>
                  <a href={"#/review?document_id=" + row.documentId}>{row.documentId}</a>
                </td>
                <td>{row.action}</td>
                <td className="log-detail">{row.detail}</td>
                <td>{row.actor}</td>
                <td>
                  <Badge tone="green">{row.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <div className="empty">没有符合筛选条件的日志</div>}
      <div className="card-foot">
        {rows.length} 条演示记录 <span>与文档节点关联，非真实服务日志</span>
      </div>
    </Card>
  );
}
