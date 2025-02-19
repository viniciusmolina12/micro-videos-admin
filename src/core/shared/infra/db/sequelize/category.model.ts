import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

export type CategoryModelProps = {
  category_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
};

@Table({ tableName: 'categories', timestamps: false })
export class CategoryModel extends Model<CategoryModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID })
  declare category_id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  declare is_active: boolean;

  @Column({ type: DataType.DATE(3), allowNull: false })
  declare created_at: Date;
}
