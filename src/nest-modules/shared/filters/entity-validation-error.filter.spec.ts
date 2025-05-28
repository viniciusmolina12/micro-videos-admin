import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { EntityValidationErrorFilter } from './entity-validation-error.filter';

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new EntityValidationError([
      'erro 1',
      'erro 2',
      'erro global',
      { name: ['erro do campo name'] },
    ]);
  }
}

describe('EntityValidationFilter (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new EntityValidationErrorFilter());
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should catch a EntityValidationError', () => {
    return request(app.getHttpServer())
      .get('/stub')
      .expect(422)
      .expect({
        statusCode: 422,
        error: 'Unprocessable Entity',
        message: ['erro 1', 'erro 2', 'erro global', 'erro do campo name'],
      });
  });
});
