import { GetGenreUseCase } from '../get-genre.usecase';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { Genre, GenreId } from '@core/genre/domain/genre.aggregate';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { Category } from '@core/category/domain/category.aggregate';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { CategorySequelizeRepository } from '@core/shared/infra/db/sequelize/category-sequelize.repository';
import {
  GenreCategoryModel,
  GenreModel,
} from '@core/genre/infra/db/sequelize/genre.model';
import { CategoryModel } from '@core/shared/infra/db/sequelize/category.model';

describe('GetGenreUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: GetGenreUseCase;
  let genreRepo: GenreSequelizeRepository;
  let categoryRepo: CategorySequelizeRepository;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepo = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepo = new CategorySequelizeRepository(CategoryModel, uow);
    useCase = new GetGenreUseCase(genreRepo, categoryRepo);
  });

  it('should throws error when entity not found', async () => {
    const genreId = new GenreId();
    await expect(() => useCase.execute({ id: genreId.id })).rejects.toThrow(
      new NotFoundError(genreId.id, Genre),
    );
  });

  it('should returns a genre', async () => {
    const categories = Category.fake().theCategories(2).build();
    await categoryRepo.bulkInsert(categories);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(categories[0].category_id)
      .addCategoryId(categories[1].category_id)
      .build();
    await genreRepo.insert(genre);
    const output = await useCase.execute({ id: genre.genre_id.id });
    expect(output).toStrictEqual({
      id: genre.genre_id.id,
      name: genre.name,
      categories: expect.arrayContaining([
        expect.objectContaining({
          id: categories[0].category_id.id,
          name: categories[0].name,
          created_at: categories[0].created_at,
        }),
        expect.objectContaining({
          id: categories[1].category_id.id,
          name: categories[1].name,
          created_at: categories[1].created_at,
        }),
      ]),
      categories_id: expect.arrayContaining([
        categories[0].category_id.id,
        categories[1].category_id.id,
      ]),
      is_active: true,
      created_at: genre.created_at,
    });
  });
});
