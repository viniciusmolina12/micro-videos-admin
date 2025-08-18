import { getModelToken } from '@nestjs/sequelize';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { CreateGenreUseCase } from '@core/genre/application/usecases/create-genre/create-genre.usecase';
import { UpdateGenreUseCase } from '@core/genre/application/usecases/update-genre/update-genre.usecase';
import { ListGenresUseCase } from '@core/genre/application/usecases/list-genres/list-genres.usecase';
import { GetGenreUseCase } from '@core/genre/application/usecases/get-genre/get-genre.usecase';
import { DeleteGenreUseCase } from '@core/genre/application/usecases/delete-genre/delete-genre.usecase';
import { IGenreRepository } from '@core/genre/domain/genre.repository';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CATEGORY_PROVIDERS } from '../categories/categories.providers';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import { GenreModel } from '@core/genre/infra/db/sequelize/genre.model';
import { CategoriesIdExistsInDatabaseValidator } from '@core/category/application/validations/categories-ids-exists-in-database.validator';
// import { GenresIdExistsInDatabaseValidator } from '@core/genre/application/validations/genres-ids-exists-in-database.validator';

export const REPOSITORIES = {
  GENRE_REPOSITORY: {
    provide: 'GenreRepository',
    useExisting: GenreSequelizeRepository,
  },
  GENRE_IN_MEMORY_REPOSITORY: {
    provide: GenreInMemoryRepository,
    useClass: GenreInMemoryRepository,
  },
  GENRE_SEQUELIZE_REPOSITORY: {
    provide: GenreSequelizeRepository,
    useFactory: (genreModel: typeof GenreModel, uow: UnitOfWorkSequelize) => {
      return new GenreSequelizeRepository(genreModel, uow);
    },
    inject: [getModelToken(GenreModel), 'UnitOfWork'],
  },
};

export const USE_CASES = {
  CREATE_GENRE_USE_CASE: {
    provide: CreateGenreUseCase,
    useFactory: (
      uow: IUnitOfWork,
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
      categoriesIdValidator: CategoriesIdExistsInDatabaseValidator,
    ) => {
      return new CreateGenreUseCase(
        uow,
        genreRepo,
        categoryRepo,
        categoriesIdValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR
        .provide,
    ],
  },
  UPDATE_GENRE_USE_CASE: {
    provide: UpdateGenreUseCase,
    useFactory: (
      uow: IUnitOfWork,
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
      categoriesIdExistsInStorageValidator: CategoriesIdExistsInDatabaseValidator,
    ) => {
      return new UpdateGenreUseCase(
        uow,
        genreRepo,
        categoryRepo,
        categoriesIdExistsInStorageValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR
        .provide,
    ],
  },
  LIST_GENRES_USE_CASE: {
    provide: ListGenresUseCase,
    useFactory: (
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
    ) => {
      return new ListGenresUseCase(genreRepo, categoryRepo);
    },
    inject: [
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    ],
  },
  GET_GENRE_USE_CASE: {
    provide: GetGenreUseCase,
    useFactory: (
      genreRepo: IGenreRepository,
      categoryRepo: ICategoryRepository,
    ) => {
      return new GetGenreUseCase(genreRepo, categoryRepo);
    },
    inject: [
      REPOSITORIES.GENRE_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    ],
  },
  DELETE_GENRE_USE_CASE: {
    provide: DeleteGenreUseCase,
    useFactory: (uow: IUnitOfWork, genreRepo: IGenreRepository) => {
      return new DeleteGenreUseCase(uow, genreRepo);
    },
    inject: ['UnitOfWork', REPOSITORIES.GENRE_REPOSITORY.provide],
  },
};

// export const VALIDATIONS = {
//   GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR: {
//     provide: GenresIdExistsInDatabaseValidator,
//     useFactory: (genreRepo: IGenreRepository) => {
//       return new GenresIdExistsInDatabaseValidator(genreRepo);
//     },
//     inject: [REPOSITORIES.GENRE_REPOSITORY.provide],
//   },
// };

export const GENRES_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
  //   VALIDATIONS,
};
