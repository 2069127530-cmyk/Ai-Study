export interface Weakness {
  topic: string;
  severity: number; // 0-100
  description: string;
}

export interface PlanItem {
  stage: string; // e.g., "第一周", "基础巩固"
  task: string;
  focus: string;
}

export interface MistakeAnalysis {
  questionId: string;
  topic: string;
  cause: string;
  solution: string;
}

export interface AnalysisResult {
  subject: string;
  estimatedScore: number;
  totalScore: number;
  summary: string;
  weaknesses: Weakness[];
  plan: PlanItem[];
  mistakes: MistakeAnalysis[];
}

export type AppState = 'idle' | 'analyzing' | 'success' | 'error';
