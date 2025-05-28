import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { EntityValidationErrorFilter } from './shared/filters/entity-validation-error.filter';
import { NotFoundErrorFilter } from './shared/filters/not-found-error.filter';
import { Reflector } from '@nestjs/core';
import { WrapperDataInterceptor } from './shared/interceptors/wrapper-data/wrapper-data.interceptor';

export function applyGlobalConfig(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: 422,
      transform: true,
    }),
  );
  app.useGlobalFilters(
    new NotFoundErrorFilter(),
    new EntityValidationErrorFilter(),
  );
  app.useGlobalInterceptors(
    new WrapperDataInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );
}
