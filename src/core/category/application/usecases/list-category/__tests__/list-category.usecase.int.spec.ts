import { CategorySequelizeRepository } from '../../../../../shared/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '../../../../../shared/infra/db/sequelize/category.model';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import { Category } from '../../../../domain/category.aggregate';
import { CategoryOutputMapper } from '../../@shared/category-output';
import { ListCategoryUseCase } from '../list-category.usecase';

describe('ListCategoriesUseCase Integration Tests', () => {
  let useCase: ListCategoryUseCase;
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new ListCategoryUseCase(repository);
  });

  it('should return output sorted by created_at when input param is empty', async () => {
    const categories = Category.fake()
      .theCategories(2)
      .withCreatedAt((i) => new Date(new Date().getTime() + 1000 + i))
      .build();

    await repository.bulkInsert(categories);
    const output = await useCase.execute({});
    const teste = [...categories].reverse().map(CategoryOutputMapper.toOutput);
    expect(output).toEqual({
      items: [...categories].reverse().map(CategoryOutputMapper.toOutput),
      total: 2,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });
  });

  it('should returns output using pagination, sort and filter', async () => {
    const categories = [
      new Category({ name: 'a' }),
      new Category({
        name: 'AAA',
      }),
      new Category({
        name: 'AaA',
      }),
      new Category({
        name: 'b',
      }),
      new Category({
        name: 'c',
      }),
    ];
    await repository.bulkInsert(categories);

    let output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      filter: 'a',
    });
    expect(output).toEqual({
      items: [categories[1], categories[2]].map(CategoryOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 2,
      per_page: 2,
      sort: 'name',
      filter: 'a',
    });
    expect(output).toEqual({
      items: [categories[0]].map(CategoryOutputMapper.toOutput),
      total: 3,
      current_page: 2,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      sort_dir: 'desc',
      filter: 'a',
    });
    expect(output).toEqual({
      items: [categories[0], categories[2]].map(CategoryOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });
  });
});
