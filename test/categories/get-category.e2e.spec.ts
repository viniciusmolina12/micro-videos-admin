import request from 'supertest';
import { instanceToPlain } from 'class-transformer';
import { ICategoryRepository } from '../../src/core/category/domain/category.repository';
import { startApp } from 'src/nest-modules/shared/testing/helpers';
import { GetCategoryFixture } from 'src/nest-modules/categories/__tests__/testing/category-fixture';
import { CategoriesController } from 'src/nest-modules/categories/categories.controller';
import { CategoryOutputMapper } from '@core/category/application/usecases/@shared/category-output';
import { Category } from '@core/category/domain/category.aggregate';
import { CategoryId } from '@core/category/domain/value-objects/category-id.vo';
import * as CategoryProviders from '../../src/nest-modules/categories/categories.providers';

describe('CategoriesController (e2e)', () => {
  const nestApp = startApp();
  describe('/categories/:id (GET)', () => {
    describe('should a response error when id is invalid or not found', () => {
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          expected: {
            message:
              'Category Not found using ID 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)('when id is $id', async ({ id, expected }) => {
        return request(nestApp.app.getHttpServer())
          .get(`/categories/${id}`)
          .expect(expected.statusCode)
          .expect(expected);
      });
    });

    // it('should return a category ', async () => {
    //   const categoryRepo = nestApp.app.get<ICategoryRepository>(
    //     CategoryProviders.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    //   );
    //   const category = Category.fake()
    //     .aCategory()
    //     .withCategoryId(new CategoryId())
    //     .build();
    //   console.log('CATEGORY', category);
    //   await categoryRepo.insert(category);

    //   const res = await request(nestApp.app.getHttpServer())
    //     .get(`/categories/${category.category_id.id}`)
    //     .expect(200);
    //   const keyInResponse = GetCategoryFixture.keysInResponse;
    //   expect(Object.keys(res.body)).toStrictEqual(['data']);
    //   expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

    //   const presenter = CategoriesController.serialize(
    //     CategoryOutputMapper.toOutput(category),
    //   );
    //   const serialized = instanceToPlain(presenter);
    //   expect(res.body.data).toStrictEqual(serialized);
    // });
  });
});
