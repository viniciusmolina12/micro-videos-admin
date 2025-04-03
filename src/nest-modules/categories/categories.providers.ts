import { getModelToken } from '@nestjs/sequelize';
import { ICategoryRepository } from '../../core/category/domain/category.repository';
import { CategorySequelizeRepository } from '@core/shared/infra/db/sequelize/category-sequelize.repository';
import { CategoryInMemoryRepository } from '@core/shared/infra/db/in-memory/category/category-in-memory.repository';
import { CategoryModel } from '@core/shared/infra/db/sequelize/category.model';
import { CreateCategoryUseCase } from '@core/category/application/usecases/create-category/create-category.usecase';
import { UpdateCategoryUseCase } from '@core/category/application/usecases/update-category/update-category.usecase';
import { ListCategoryUseCase } from '@core/category/application/usecases/list-category/list-category.usecase';
import { GetCategoryUseCase } from '@core/category/application/usecases/get-category/get-category.usecase';
import { DeleteCategoryUseCase } from '@core/category/application/usecases/delete-category/delete-category.usecase';

export const REPOSITORIES = {
  CATEGORY_REPOSITORY: {
    provide: 'CategoryRepository',
    useExisting: CategorySequelizeRepository,
  },
  CATEGORY_IN_MEMORY_REPOSITORY: {
    provide: CategoryInMemoryRepository,
    useClass: CategoryInMemoryRepository,
  },
  CATEGORY_SEQUELIZE_REPOSITORY: {
    provide: CategorySequelizeRepository,
    useFactory: (categoryModel: typeof CategoryModel) => {
      return new CategorySequelizeRepository(categoryModel);
    },
    inject: [getModelToken(CategoryModel)],
  },
};

export const USE_CASES = {
  CREATE_CATEGORY_USE_CASE: {
    provide: CreateCategoryUseCase,
    useFactory: (categoryRepo: ICategoryRepository) => {
      return new CreateCategoryUseCase(categoryRepo);
    },
    inject: [REPOSITORIES.CATEGORY_REPOSITORY.provide],
  },
  UPDATE_CATEGORY_USE_CASE: {
    provide: UpdateCategoryUseCase,
    useFactory: (categoryRepo: ICategoryRepository) => {
      return new UpdateCategoryUseCase(categoryRepo);
    },
    inject: [REPOSITORIES.CATEGORY_REPOSITORY.provide],
  },
  LIST_CATEGORIES_USE_CASE: {
    provide: ListCategoryUseCase,
    useFactory: (categoryRepo: ICategoryRepository) => {
      return new ListCategoryUseCase(categoryRepo);
    },
    inject: [REPOSITORIES.CATEGORY_REPOSITORY.provide],
  },
  GET_CATEGORY_USE_CASE: {
    provide: GetCategoryUseCase,
    useFactory: (categoryRepo: ICategoryRepository) => {
      return new GetCategoryUseCase(categoryRepo);
    },
    inject: [REPOSITORIES.CATEGORY_REPOSITORY.provide],
  },
  DELETE_CATEGORY_USE_CASE: {
    provide: DeleteCategoryUseCase,
    useFactory: (categoryRepo: ICategoryRepository) => {
      return new DeleteCategoryUseCase(categoryRepo);
    },
    inject: [REPOSITORIES.CATEGORY_REPOSITORY.provide],
  },
};


export const CATEGORY_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
};