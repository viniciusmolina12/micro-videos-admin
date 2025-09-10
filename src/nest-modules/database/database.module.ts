import { CastMemberModel } from '@core/cast-member/infra/db/sequelize/cast-member-sequelize';
import {
  GenreCategoryModel,
  GenreModel,
} from '@core/genre/infra/db/sequelize/genre.model';
import { CategoryModel } from '@core/shared/infra/db/sequelize/category.model';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import {
  VideoModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoCastMemberModel,
} from '@core/video/infra/db/sequelize/video.model';
import { ImageMediaModel } from '@core/video/infra/db/sequelize/image-media.model';
import { AudioVideoMediaModel } from '@core/video/infra/db/sequelize/audio-video-media.model';
import { Global, Module, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CONFIG_SCHEMA_TYPE } from 'src/nest-modules/config/config.module';

const models = [
  CategoryModel,
  GenreModel,
  GenreCategoryModel,
  CastMemberModel,
  VideoModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoCastMemberModel,
  ImageMediaModel,
  AudioVideoMediaModel,
];
@Global()
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
  providers: [
    {
      provide: UnitOfWorkSequelize,
      useFactory: (sequelize: Sequelize) => {
        return new UnitOfWorkSequelize(sequelize);
      },
      inject: [getConnectionToken()],
      scope: process.env.NODE_ENV === 'e2e' ? Scope.DEFAULT : Scope.REQUEST,
    },
    {
      provide: 'UnitOfWork',
      useExisting: UnitOfWorkSequelize,
      scope: process.env.NODE_ENV === 'e2e' ? Scope.DEFAULT : Scope.REQUEST,
    },
  ],
  exports: ['UnitOfWork'],
})
export class DatabaseModule {}
