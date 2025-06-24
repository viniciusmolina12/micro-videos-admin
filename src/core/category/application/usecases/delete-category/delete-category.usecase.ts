import { IUseCase } from '../../../../shared/application/use-case.interface';
import { CategoryId } from '../../../domain/value-objects/category-id.vo';
import { ICategoryRepository } from '../../../domain/category.repository';

export class DeleteCategoryUseCase
  implements IUseCase<DeleteCategoryInput, DeleteCategoryOutput>
{
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(input: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
    const categoryId = new CategoryId(input.id);
    await this.categoryRepository.delete(categoryId);
  }
}

export type DeleteCategoryInput = {
  id: string;
};

export type DeleteCategoryOutput = void;
