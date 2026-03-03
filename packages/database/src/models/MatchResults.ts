import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { ParsedResume } from './ParsedResume';
import { JobRole } from './JobRole';

@Table({ tableName: 'MatchResults', timestamps: true })
export class MatchResult extends Model {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => ParsedResume)
  @Column({ type: DataType.UUID, allowNull: false })
  declare resumeId: string;

  @BelongsTo(() => ParsedResume)
  declare resume: ParsedResume;

  @ForeignKey(() => JobRole)
  @Column({ type: DataType.UUID, allowNull: false })
  declare jobId: string;

  @BelongsTo(() => JobRole)
  declare jobRole: JobRole;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare score: number;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare details: { matchedSkills: string[]; missingSkills: string[] };
}
