import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { ParsedResume } from './ParsedResume';

@Table({ tableName: 'ResumeInsights', timestamps: true })
export class ResumeInsight extends Model {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => ParsedResume)
  @Column({ type: DataType.UUID, allowNull: false })
  declare resumeId: string;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare recommendations: string[];
}
