import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { WrapperDataInterceptor } from './nest-modules/shared/interceptors/wrapper-data/wrapper-data.interceptor';
import { NotFoundErrorFilter } from './nest-modules/shared/filters/not-found-error.filter';
import { EntityValidationErrorFilter } from './nest-modules/shared/filters/entity-validation-error.filter';
import { applyGlobalConfig } from './nest-modules/global-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  applyGlobalConfig(app);
  await app.listen(3000);
}
bootstrap();
