import { CategoryId } from '../../../../domain/value-objects/category-id.vo';
import { CategorySequelizeRepository } from '../../../../../shared/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '../../../../../shared/infra/db/sequelize/category.model';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import { GetCategoryUseCase } from '../get-category.usecase';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { Category } from '../../../../domain/category.aggregate';

describe('GetCategoryUseCase Integration Tests', () => {
  let useCase: GetCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new GetCategoryUseCase(repository);
  });

  it('should throws error when entity not found', async () => {
    const categoryId = new CategoryId();
    await expect(() => useCase.execute({ id: categoryId.id })).rejects.toThrow(
      new NotFoundError(categoryId.id, Category),
    );
  });

  it('should returns a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);

    const output = await useCase.execute({ id: category.category_id!.id });

    expect(output).toStrictEqual({
      id: category.category_id!.id,
      name: category.name,
      description: category.description,
      is_active: category.is_active,
      created_at: category.created_at,
    });
  });
});
