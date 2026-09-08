/** Single data boundary. Mock is explicit; HTTP must never silently fall back to demo data. */
import { documents, filters, systemSections, auditLogs, qualityTrend } from "../mocks/demo";
import type { PlatformAdapter } from "../domain/platform";
export const platformApi = {
  mode: "MOCK" as const,
  getDocuments: () => documents,
  getDocument: (id: string) => documents.find((d) => d.id === id),
  getFilters: () => filters,
  getSystemSections: () => systemSections,
  getAuditLogs: () => auditLogs,
  getTrend: () => qualityTrend,
  getDashboard: () => ({
    total: documents.length,
    cards: filters
      .slice(1)
      .map((f) => ({ ...f, count: documents.filter((d) => d.workflowStatus === f.value).length })),
    complete: documents.filter((d) => d.finalConfirmed).length,
    attention: documents.filter((d) => d.verificationReady && !d.finalConfirmed).length,
  }),
} satisfies PlatformAdapter & Record<string, unknown>;
