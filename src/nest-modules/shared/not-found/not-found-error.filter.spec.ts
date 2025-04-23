import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Entity } from '@core/shared/domain/entity';
import request from 'supertest';
import { ValueObject } from '@core/shared/domain/value-object';
import { NotFoundErrorFilter } from './not-found-error.filter';

class StubEntity extends Entity {
  get entity_id(): ValueObject {
    throw new Error('Method not implemented.');
  }
  toJSON() {
    throw new Error('Method not implemented.');
  }
  constructor(public name: string) {
    super();
  }
}

@Controller('stub')
class StubController {
  @Get()
  index() {
    throw new NotFoundError('fake-id', StubEntity);
  }
}

describe('NotFoundFilter E2E Tests', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [StubController],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new NotFoundErrorFilter());
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should catch NotFoundError and return 404 status code', async () => {
    return request(server).get('/stub').expect(404).expect({
      statusCode: 404,
      error: 'Not Found',
      message: 'StubEntity Not found usind ID fake-id',
    });
  });
});
