import { Table, Column, Model, DataType, Default } from 'sequelize-typescript';

export interface ExtractedResumeData {
  skills?: string[];
  experienceYears?: number;
  education?: Array<{ degree: string; institution: string }>;
  [key: string]: any;
}

@Table({ tableName: 'parsed_resumes', timestamps: true })
export class ParsedResume extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  minioPath!: string;

  @Default('uploaded')
  @Column({
    type: DataType.ENUM('uploaded', 'extracted', 'parsed', 'failed'),
    allowNull: false,
  })
  status!: string;

  @Column({ type: DataType.JSONB, allowNull: true })
  extractedData!: ExtractedResumeData;
}
