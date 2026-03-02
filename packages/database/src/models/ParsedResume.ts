import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  ForeignKey,
  BelongsTo,
  CreatedAt,
} from 'sequelize-typescript';
import { User } from './User';

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

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @BelongsTo(() => User)
  declare uploadedBy: User;

  @Column({ type: DataType.STRING, allowNull: false })
  declare minioPath: string;

  @Default('uploaded')
  @Column({
    type: DataType.ENUM('uploaded', 'extracted', 'parsed', 'failed'),
    allowNull: false,
  })
  declare status: string;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare extractedData: ExtractedResumeData;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;
}
