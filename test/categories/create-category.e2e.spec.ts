import request from 'supertest';
import { CreateCategoryFixture } from 'src/nest-modules/categories/__tests__/testing/category-fixture';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories/categories.providers';
import { startApp } from 'src/nest-modules/shared/testing/helpers';
import { CategoryId } from '@core/category/domain/value-objects/category-id.vo';
import { CategoryOutputMapper } from '@core/category/application/usecases/@shared/category-output';
import { CategoriesController } from 'src/nest-modules/categories/categories.controller';

describe('CategoriesController (e2e)', () => {
  const appHelper = startApp();
  let categoryRepo: ICategoryRepository;
  beforeEach(async () => {
    categoryRepo = appHelper.app.get<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  describe('/categories (POST)', () => {
    describe('should create a category', () => {
      const arrange = CreateCategoryFixture.arrangeForCreate();
      test.each(arrange)(
        'when body is $send_data',
        async ({ send_data, expected }) => {
          const response = await request(appHelper.app.getHttpServer())
            .post('/categories')
            .send(send_data)
            .expect(201);
          const keysInReponse = CreateCategoryFixture.keysInResponse;
          expect(Object.keys(response.body)).toStrictEqual(['data']);
          const id = response.body.data.id;
          const entity = await categoryRepo.findById(new CategoryId(id));
          const presenter = CategoriesController.serialize(
            CategoryOutputMapper.toOutput(entity!),
          );

          const serialized = {
            id: presenter.id,
            created_at: presenter.created_at.toISOString(),
          };
          expect(response.body.data).toStrictEqual({
            id: serialized.id,
            created_at: serialized.created_at,
            ...expected,
          });
        },
      );
    });

    describe('should return a response error with 422 status code when request body is invalid', () => {
      const invalidRequest = CreateCategoryFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        request(appHelper.app.getHttpServer())
          .post('/categories')
          .send(value.send_data)
          .expect(422)
          .expect(value.expect);
      });
    });

    describe('should return a response error with 422 status code when throw EntityValidationError', () => {
      const invalidRequest =
        CreateCategoryFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        request(appHelper.app.getHttpServer())
          .post('/categories')
          .send(value.send_data)
          .expect(422)
          .expect(value.expect);
      });
    });
  });
});
