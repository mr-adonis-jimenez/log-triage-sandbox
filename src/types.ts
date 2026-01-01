export type LogLevel = "INFO" | "WARN" | "ERROR";

export interface ParsedLog {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  raw: string;
}

export interface DetectionResult {
  name: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  count: number;
  mitre?: {
    tactic: string;
    technique: string;
    techniqueId: string;
  };
}

