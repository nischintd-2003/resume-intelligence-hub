import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { ParsedResume } from './ParsedResume';
import { JobRole } from './JobRole';

@Table({ tableName: 'MatchResults', timestamps: true })
export class MatchResult extends Model {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => ParsedResume)
  @Column({ type: DataType.UUID, allowNull: false })
  declare resumeId: string;

  @ForeignKey(() => JobRole)
  @Column({ type: DataType.UUID, allowNull: false })
  declare jobId: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare score: number;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare details: { matchedSkills: string[]; missingSkills: string[] };
}
