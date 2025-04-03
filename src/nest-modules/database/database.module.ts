import { CategoryModel } from '@core/shared/infra/db/sequelize/category.model';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { CONFIG_SCHEMA_TYPE } from 'src/nest-modules/config/config.module';

const models = [CategoryModel];
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: async (configService: ConfigService<CONFIG_SCHEMA_TYPE>) => {
        const dbVendor = configService.get('DB_VENDOR');
        if (configService.get('DB_VENDOR') === 'sqlite') {
          return {
            dialect: 'sqlite',
            models,
            host: configService.get('DB_HOST'),
            storage: configService.get('DB_DATABASE'),
            logging: configService.get('DB_LOGGING'),
            autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
          };
        }

        if (configService.get('DB_VENDOR') === 'mysql') {
          return {
            dialect: 'mysql',
            models,
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            logging: configService.get('DB_LOGGING'),
            autoLoadModels: configService.get('DB_AUTO_LOAD_MODELS'),
          };
        }

        throw new Error(`Unsupported database config: ${dbVendor}`);
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
