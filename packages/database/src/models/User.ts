import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { ParsedResume } from './ParsedResume';
import { JobRole } from './JobRole';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  passwordHash!: string;

  @HasMany(() => ParsedResume)
  resumes!: ParsedResume[];

  @HasMany(() => JobRole)
  jobRoles!: JobRole[];
}
