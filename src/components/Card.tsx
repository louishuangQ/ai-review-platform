import type { ReactNode } from "react";

export function Card({
  title,
  children,
  onDetail,
}: {
  title: string;
  children: ReactNode;
  onDetail?: () => void;
}) {
  return (
    <section className="card">
      <div className="card-head">
        <h3>{title}</h3>
        {onDetail && <button onClick={onDetail}>查看详情</button>}
      </div>
      {children}
    </section>
  );
}
