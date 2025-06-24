import { CategoryId } from '../../../../domain/value-objects/category-id.vo';
import { CategorySequelizeRepository } from '../../../../../shared/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '../../../../../shared/infra/db/sequelize/category.model';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import { DeleteCategoryUseCase } from '../delete-category.usecase';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { Category } from '../../../../domain/category.aggregate';

describe('DeleteCategoryUseCase Integration Tests', () => {
  let useCase: DeleteCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new DeleteCategoryUseCase(repository);
  });

  it('should throws error when entity not found', async () => {
    const categoryId = new CategoryId();
    await expect(() => useCase.execute({ id: categoryId.id })).rejects.toThrow(
      new NotFoundError(categoryId.id, Category),
    );
  });

  it('should delete a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);

    await useCase.execute({
      id: category.category_id.id,
    });

    const noHasModel = await CategoryModel.findByPk(category.category_id.id);
    expect(noHasModel).toBeNull();
  });
});
