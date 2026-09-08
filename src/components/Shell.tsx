import type { ReactNode } from "react";
import { routes, type Navigate, type Route } from "../types";
const subtitles: Record<Route, string> = {
  overview: "把注意力放在下一步需要处理的文档上",
  documents: "统一接入、预览校验与版本追踪",
  review: "原文有据，复审有迹，人工最终决定",
  reports: "查阅已完成人工最终确认的审核结果",
  system: "管理平台配置、审核策略与执行一致性",
  logs: "串联每一次审核、决策和系统操作",
};
export function Shell({
  route,
  go,
  children,
}: {
  route: Route;
  go: Navigate;
  children: ReactNode;
}) {
  return (
    <div className="shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        跳至主要内容
      </a>
      <aside className="sidebar">
        <a href="#/overview" className="brand">
          <span className="mark">AI</span>
          <span>
            <strong>智审 · 文档质量平台</strong>
            <small>DOCUMENT REVIEW</small>
          </span>
        </a>
        <div className="workspace-label">
          工作空间 <span>产品技术文档</span>
        </div>
        <nav aria-label="主导航">
          {routes.map(([key, code, label], i) => (
            <div key={key}>
              {i === 4 && <div className="nav-label">管理与追溯</div>}
              <button
                aria-current={route === key ? "page" : undefined}
                className={route === key ? "active" : ""}
                onClick={() => go(key)}
              >
                <span className="nav-code">{code}</span>
                {label}
                {route === key && <span className="nav-current" />}
              </button>
            </div>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="live-dot" />
          本地演示环境<p>示例数据，供流程与界面评审</p>
        </div>
        <div className="side-foot">
          <div className="avatar">JW</div>
          <span>
            Jamie Wang<small>平台管理员 · 演示角色</small>
          </span>
        </div>
      </aside>
      <main id="main-content" tabIndex={-1}>
        <header className="topbar">
          <div className="breadcrumb">
            工作台 <span>/</span> {routes.find(([r]) => r === route)?.[2]}
          </div>
          <div className="topbar-actions">
            <span className="environment">LOCAL DEMO</span>
            <span className="topbar-divider" />
            <span>产品线工作空间</span>
            <div className="avatar small">JW</div>
          </div>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                DOCUMENT QUALITY / {routes.find(([r]) => r === route)?.[1]}
              </div>
              <h1>{routes.find(([r]) => r === route)?.[2]}</h1>
              <p>{subtitles[route]}</p>
            </div>
            <button className="primary" onClick={() => go("documents")}>
              查看文档工作台 <span>↗</span>
            </button>
          </div>
          <div className="demo-banner">
            <span className="demo-label">演示模式</span>
            <span>本地脱敏示例 · 可浏览、筛选和导出；实际审核及配置写入待接入业务服务。</span>
          </div>
          {children}
          <footer>
            智审平台 <span>版本化契约 · 原文证据 · 人工门禁</span>
            <b>LOCAL / V1.2</b>
          </footer>
        </div>
      </main>
    </div>
  );
}
