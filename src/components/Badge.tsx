import type { Tone } from "../domain/platform";
export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={"badge badge-" + tone}>{children}</span>;
}
