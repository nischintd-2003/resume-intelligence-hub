import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'job_roles', timestamps: true })
export class JobRole extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  title!: string;

  @Column({ type: DataType.JSONB, allowNull: false })
  requiredSkills!: string[];
}
