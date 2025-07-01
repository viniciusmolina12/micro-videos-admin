import { Category } from '../../../domain/category.aggregate';

export type CategoryOutput = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
};

export class CategoryOutputMapper {
  static toOutput(entity: Category): CategoryOutput {
    const { category_id, ...props } = entity.toJSON();
    return {
      id: entity.category_id!.id,
      ...props,
    } as CategoryOutput;
  }
}
