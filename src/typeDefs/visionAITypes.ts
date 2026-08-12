export interface LogEntry {
  id: string;
  flyerUrl: string;
  supermarket: string;
  date: string;
  errorCode: 'LOW_CONFIDENCE_OCR' | 'JSON_SCHEMA_MISMATCH' | 'MISSING_PRICE_TAGS';
  status: 'ACTION_REQUIRED' | 'IN_REVIEW' | 'RESOLVED';
}

export interface ErrorInsights {
  lowConfidenceOcr: number;
  schemaMismatch: number;
  missingDataFields: number;
}

export interface VisionLogsData {
  logs: LogEntry[];
  insights: ErrorInsights;
  resolvedThisWeek: number;
}
