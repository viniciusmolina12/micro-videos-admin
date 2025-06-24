import { CategoryId } from '../../../../domain/value-objects/category-id.vo';
import { CategorySequelizeRepository } from '../../../../../shared/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '../../../../../shared/infra/db/sequelize/category.model';

import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import { CreateCategoryUseCase } from '../../create-category/create-category.usecase';

describe('CreateCategoryUseCase Integration Tests', () => {
  let useCase: CreateCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new CreateCategoryUseCase(repository);
  });

  it('should create a category', async () => {
    const output = await useCase.execute({
      name: 'test',
    });

    const entity = await repository.findById(new CategoryId(output.id));
    expect(output).toStrictEqual({
      id: entity!.category_id.id,
      name: 'test',
      description: null,
      is_active: true,
      created_at: entity!.created_at,
    });

    expect(entity!.toJSON()).toStrictEqual({
      category_id: entity!.category_id.id,
      name: 'test',
      description: null,
      is_active: true,
      created_at: entity!.created_at,
    });
  });

  it('should create a category with description', async () => {
    const output = await useCase.execute({
      name: 'test',
      description: 'some description',
    });

    const entity = await repository.findById(new CategoryId(output.id));
    expect(output).toStrictEqual({
      id: entity!.category_id.id,
      name: 'test',
      description: 'some description',
      is_active: true,
      created_at: entity!.created_at,
    });

    expect(entity!.toJSON()).toStrictEqual({
      category_id: entity!.category_id.id,
      name: 'test',
      description: 'some description',
      is_active: true,
      created_at: entity!.created_at,
    });
  });

  it('should create a category with is_active', async () => {
    const output = await useCase.execute({
      name: 'test',
      is_active: false,
    });

    const entity = await repository.findById(new CategoryId(output.id));
    expect(output).toStrictEqual({
      id: entity!.category_id.id,
      name: 'test',
      description: null,
      is_active: false,
      created_at: entity!.created_at,
    });

    expect(entity!.toJSON()).toStrictEqual({
      category_id: entity!.category_id.id,
      name: 'test',
      description: null,
      is_active: false,
      created_at: entity!.created_at,
    });
  });
});
