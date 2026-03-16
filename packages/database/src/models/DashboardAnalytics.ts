import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from './User';

@Table({ tableName: 'dashboard_analytics', timestamps: true })
export class DashboardAnalytics extends Model {
  @Column({ type: DataType.UUID, primaryKey: true, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false, unique: true })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({ type: DataType.JSONB, defaultValue: [] })
  declare topSkills: { skill: string; count: number }[];

  @Column({ type: DataType.JSONB, defaultValue: [] })
  declare topUniversities: { university: string; count: number }[];

  @Column({ type: DataType.JSONB, defaultValue: [] })
  declare matchAverages: { jobTitle: string; averageScore: number }[];

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  declare totalResumes: number;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;
}
