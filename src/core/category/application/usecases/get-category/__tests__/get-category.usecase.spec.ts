import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import {
  InvalidUuidError,
  Uuid,
} from '../../../../../shared/domain/value-objects/uuid.vo';
import { CategoryInMemoryRepository } from '../../../../../shared/infra/db/in-memory/category/category-in-memory.repository';
import { Category } from '../../../../domain/category.entity';
import { GetCategoryUseCase } from '../get-category.usecase';
describe('GetCategoryUseCase Unit Tests', () => {
  let useCase: GetCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new GetCategoryUseCase(repository);
  });

  it('should throws error when entity not found', async () => {
    await expect(() => useCase.execute({ id: 'fake id' })).rejects.toThrow(
      new InvalidUuidError(),
    );

    const categoryId = new Uuid();
    await expect(() => useCase.execute({ id: categoryId.id })).rejects.toThrow(
      new NotFoundError(categoryId.id, Category),
    );
  });

  it('should returns a category', async () => {
    const items = [Category.create({ name: 'Movie' })];
    repository.items = items;
    const spyFindById = jest.spyOn(repository, 'findById');
    const output = await useCase.execute({ id: items[0].category_id.id });
    expect(spyFindById).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: items[0].category_id.id,
      name: 'Movie',
      description: null,
      is_active: true,
      created_at: items[0].created_at,
    });
  });
});
