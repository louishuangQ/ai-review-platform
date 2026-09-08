import { useState } from "react";
import { platformApi } from "../adapters/platform";
import { Card } from "../components/Card";
import { Badge } from "../components/Badge";
import { ConnectionSettings } from "../components/ConnectionSettings";
export function SystemPage() {
  const sections = platformApi.getSystemSections(),
    [index, setIndex] = useState(0);
  const selected = sections[index];
  return (
    <div className="system-layout">
      <aside>
        <div className="nav-label">配置分区</div>
        <button onClick={() => setIndex(0)}>服务地址与端口</button>
        <button onClick={() => setIndex(1)}>飞书知识库接入</button>
        <button onClick={() => setIndex(5)}>定期增量审核计划</button>
        {sections.map((s, i) => (
          <button key={s[0]} className={i === index ? "active" : ""} onClick={() => setIndex(i)}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            {s[0]}
          </button>
        ))}
      </aside>
      <section>
        {index === 0 && <ConnectionSettings key="services" section="services" />}
        {index === 1 && <ConnectionSettings key="wiki" section="wiki" />}
        {index === 5 && <ConnectionSettings key="schedule" section="schedule" />}
        <Card title={selected[0]}>
          <div className="system-intro">
            <div>
              <h2>{selected[1]}</h2>
              <p>配置说明与接入边界</p>
            </div>
            <Badge tone="amber">演示 · 只读</Badge>
          </div>
          <div className="config-rows">
            {selected[2].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <Badge>已定义</Badge>
              </div>
            ))}
          </div>
          <div className="callout">
            配置写入在服务接入后开放。实际运行状态须以各服务健康检查为准，当前页面不代表后端在线。
          </div>
        </Card>
        <div className="capability-note">
          <b>变更流程</b>
          <span>配置修改 → 标准样本回归 → 人工审批 → 版本发布 → 审计记录</span>
        </div>
      </section>
    </div>
  );
}
