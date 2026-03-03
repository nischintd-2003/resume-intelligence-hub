import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  HasMany,
} from 'sequelize-typescript';
import { User } from './User';
import { MatchResult } from './MatchResults';

@Table({ tableName: 'job_roles', timestamps: true })
export class JobRole extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @BelongsTo(() => User)
  declare uploadedBy: User;

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Column({ type: DataType.JSONB, allowNull: false })
  declare requiredSkills: string[];

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare isActive: boolean;

  @HasMany(() => MatchResult)
  declare matches: MatchResult[];
}
