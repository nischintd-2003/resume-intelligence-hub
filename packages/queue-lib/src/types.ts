export interface ExtractTextJob {
  resumeId: string;
  userId: string;
  minioPath: string;
}

export interface StructureDataJob {
  resumeId: string;
  userId: string;
  rawText: string;
}

export interface CalculateMatchJob {
  resumeId?: string;
  jobId?: string;
  userId: string;
}

export interface GenerateInsightsJob {
  resumeId: string;
  userId: string;
  jobId?: string;
}
