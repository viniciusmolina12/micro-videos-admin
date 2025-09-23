import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoriesModule } from '../categories/categories.module';
import {
  VideoCastMemberModel,
  VideoCategoryModel,
  VideoGenreModel,
  VideoModel,
} from '../../core/video/infra/db/sequelize/video.model';
import { ImageMediaModel } from '../../core/video/infra/db/sequelize/image-media.model';
import { AudioVideoMediaModel } from '../../core/video/infra/db/sequelize/audio-video-media.model';
// import { RabbitmqModule } from '../rabbitmq-module/rabbitmq.module';
// import { VideosConsumers } from './videos.consumers';
import { GenresModule } from '../genre/genres.module';
import { CastMembersModule } from '../cast-members/cast-member.module';
import { VIDEOS_PROVIDERS } from './videos.providers';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { VideosConsumers } from './videos.consumers';

@Module({
  imports: [
    SequelizeModule.forFeature([
      VideoModel,
      VideoCategoryModel,
      VideoGenreModel,
      VideoCastMemberModel,
      ImageMediaModel,
      AudioVideoMediaModel,
    ]),
    RabbitmqModule.forFeature(),
    CategoriesModule,
    GenresModule,
    CastMembersModule,
  ],
  controllers: [VideosController],
  providers: [
    ...Object.values(VIDEOS_PROVIDERS.REPOSITORIES),
    ...Object.values(VIDEOS_PROVIDERS.USE_CASES),
    ...Object.values(VIDEOS_PROVIDERS.LISTENERS),
    VideosConsumers,
  ],
  // exports: [VIDEOS_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide],
})
export class VideosModule {}
