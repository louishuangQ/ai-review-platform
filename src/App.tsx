import { Shell } from "./components/Shell";
import { DocumentsPage } from "./pages/DocumentsPage";
import { LogsPage } from "./pages/LogsPage";
import { OverviewPage } from "./pages/OverviewPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ReviewPage } from "./pages/ReviewPage";
import { SystemPage } from "./pages/SystemPage";
import { useHash } from "./lib/navigation";
import { routes, type Navigate, type Route } from "./types";
export function App() {
  const hash = useHash();
  const candidate = hash.replace(/^#\//, "").split("?")[0] as Route;
  const route = routes.some(([r]) => r === candidate) ? candidate : "overview";
  const go: Navigate = (next, query = "") => {
    location.hash = "#/" + next + query;
  };
  return (
    <Shell route={route} go={go}>
      {route === "overview" && <OverviewPage go={go} />}
      {route === "documents" && <DocumentsPage go={go} />}
      {route === "review" && <ReviewPage />}
      {route === "reports" && <ReportsPage />}
      {route === "system" && <SystemPage />}
      {route === "logs" && <LogsPage />}
    </Shell>
  );
}
