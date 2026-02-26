import { Table, Column, Model, DataType, HasMany, CreatedAt } from 'sequelize-typescript';
import { ParsedResume } from './ParsedResume';
import { JobRole } from './JobRole';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare username: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare passwordHash: string;

  @HasMany(() => ParsedResume)
  declare resumes: ParsedResume[];

  @HasMany(() => JobRole)
  declare jobRoles: JobRole[];

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;
}
