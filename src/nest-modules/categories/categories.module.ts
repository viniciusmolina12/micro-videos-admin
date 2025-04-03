import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { getModelToken, SequelizeModule } from '@nestjs/sequelize';
import { CategoryModel } from '@core/shared/infra/db/sequelize/category.model';
import { CategorySequelizeRepository } from '@core/shared/infra/db/sequelize/category-sequelize.repository';
import {CATEGORY_PROVIDERS } from './categories.providers';

@Module({
  imports: [SequelizeModule.forFeature([CategoryModel])],
  controllers: [CategoriesController],
  providers: [...Object.values(CATEGORY_PROVIDERS.REPOSITORIES), ...Object.values(CATEGORY_PROVIDERS.USE_CASES)]
})
export class CategoriesModule {}
