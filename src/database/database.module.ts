import { CategoryModel } from '@core/shared/infra/db/sequelize/category.model';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

const models = [CategoryModel];
@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'sqlite',
      host: ':memory:',
      logging: false,
      models,
    }),
    // SequelizeModule.forFeature([CategoryModel]),
  ],
})
export class DatabaseModule {}
