import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { InvalidUuidError } from '../../../../../shared/domain/value-objects/uuid.vo';
import { CategoryId } from '../../../../domain/value-objects/category-id.vo';
import { CategoryInMemoryRepository } from '../../../../../shared/infra/db/in-memory/category/category-in-memory.repository';
import { Category } from '../../../../domain/category.aggregate';
import { UpdateCategoryUseCase } from '../update-category.usecase';

describe('UpdateCategoryUseCase Unit Tests', () => {
  let useCase: UpdateCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new UpdateCategoryUseCase(repository);
  });

  it('should throws error when entity not found', async () => {
    await expect(() =>
      useCase.execute({ id: 'fake id', name: 'fake' }),
    ).rejects.toThrow(new InvalidUuidError());

    const categoryId = new CategoryId();
    await expect(() =>
      useCase.execute({ id: categoryId.id, name: 'fake' }),
    ).rejects.toThrow(new NotFoundError(categoryId.id, Category));
  });

  it('should throw an error when aggregate is not valid', async () => {
    const aggregate = new Category({ name: 'Movie' });
    repository.items = [aggregate];
    await expect(() =>
      useCase.execute({
        id: aggregate.category_id.id,
        name: 't'.repeat(256),
      }),
    ).rejects.toThrowError('Validator Error');
  });

  it('should update a category', async () => {
    const entity = new Category({ name: 'Movie' });
    repository.items = [entity];

    const output = await useCase.execute({
      id: entity.category_id.id,
      name: 'test',
      description: 'some description',
    });

    expect(output).toStrictEqual({
      id: entity.category_id.id,
      name: 'test',
      description: 'some description',
      is_active: true,
      created_at: entity.created_at,
    });
  });
});
