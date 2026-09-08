/** UI read models. Service implementation and scoring rules stay outside the web app. */
export type Tone = "purple" | "blue" | "green" | "amber" | "red" | "neutral";
export interface FilterOption {
  value: string;
  label: string;
  tone: Tone;
}
export interface ReviewIssue {
  id: string;
  dimension: string;
  result: "Pass" | "Fail" | "New";
  block: string;
  evidence: string;
  problem: string;
  suggestion: string;
  initialProblem?: string;
  initialSuggestion?: string;
}
export interface WorkflowNode {
  name: string;
  state: string;
  tone: Tone;
  started: string;
  finished: string;
  input: string;
  output: string;
  log: string;
  executor: string;
  retry: number;
  error: string;
}
export interface DocumentRecord {
  id: string;
  name: string;
  source: string;
  product: string;
  author: string;
  updated: string;
  workflowStatus: string;
  statusLabel: string;
  tone: Tone;
  preview: string;
  ai: string;
  human: string;
  rewrite: string;
  final: string;
  time: string;
  round: number;
  activeNode: number;
  finalConfirmed: boolean;
  finalScore: number | null;
  ruleCount: number;
  executedRules: number;
  reviewReady: boolean;
  verificationReady: boolean;
  reviewer: string;
  rewriteCount: number;
  summary: string;
  scores: { label: string; ai: number | null; human: number | null }[];
  issues: ReviewIssue[];
  nodes: WorkflowNode[];
  markdown: string;
}
export interface PlatformAdapter {
  mode: "MOCK";
  getDocuments(): DocumentRecord[];
  getDocument(id: string): DocumentRecord | undefined;
  getFilters(): FilterOption[];
}
