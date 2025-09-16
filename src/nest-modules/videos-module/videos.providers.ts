import { getModelToken } from '@nestjs/sequelize';
import { VideoInMemoryRepository } from '../../core/video/infra/db/in-memory/video-in-memory.repository';
import { IVideoRepository } from '../../core/video/domain/video.repository';
import { UnitOfWorkSequelize } from '../../core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { IUnitOfWork } from '../../core/shared/domain/repository/unit-of-work.interface';
import { CATEGORY_PROVIDERS } from '../categories/categories.providers';
import { VideoSequelizeRepository } from '../../core/video/infra/db/sequelize/video-sequelize.repository';
import { VideoModel } from '../../core/video/infra/db/sequelize/video.model';
import { GENRES_PROVIDERS } from '../genre/genres.providers';
import { CAST_MEMBERS_PROVIDERS } from '../cast-members/cast-members.providers';
import { IGenreRepository } from '../../core/genre/domain/genre.repository';
import { ICastMemberRepository } from '../../core/cast-member/domain/cast-member.repository';
import { ICategoryRepository } from '../../core/category/domain/category.repository';
import { ApplicationService } from '../../core/shared/application/application.service';
import { IStorage } from '../../core/shared/application/storage.interface';
import { CreateVideoUseCase } from '../../core/video/application/usecases/create-video/create-video.usecase';
import { CategoriesIdExistsInDatabaseValidator } from '../../core/category/application/validations/categories-ids-exists-in-database.validator';
import { GenresIdExistsInDatabaseValidator } from '../../core/genre/application/validations/genres-ids-exists-in-database.validator';
import { CastMembersIdExistsInDatabaseValidator } from '../../core/cast-member/application/validations/cast-members-ids-exists-in-database.validator';
import { UpdateVideoUseCase } from '../../core/video/application/usecases/update-video/update-video.usecase';
import { GetVideoUseCase } from '../../core/video/application/usecases/get-video/get-video.usecase';
import { ProcessAudioVideoMediasUseCase } from '../../core/video/application/usecases/process-audio-video-medias/process-audio-video-medias.usecase';
// import { PublishVideoMediaReplacedInQueueHandler } from '../../core/video/application/handlers/publish-video-media-replaced-in-queue.handler';
// import { IMessageBroker } from '../../core/shared/application/message-broker.interface';
import { UploadAudioVideoMediasUseCase } from '@core/video/application/usecases/upload-audio-video-medias/upload-audio-video-media.usecase';
import { PublishVideoMediaReplacedInQueueListener } from '@core/video/application/listeners/publish-video-media-replaced-in-queue.listener';

export const REPOSITORIES = {
  VIDEO_REPOSITORY: {
    provide: 'VideoRepository',
    useExisting: VideoSequelizeRepository,
  },
  VIDEO_IN_MEMORY_REPOSITORY: {
    provide: VideoInMemoryRepository,
    useClass: VideoInMemoryRepository,
  },
  VIDEO_SEQUELIZE_REPOSITORY: {
    provide: VideoSequelizeRepository,
    useFactory: (videoModel: typeof VideoModel, uow: UnitOfWorkSequelize) => {
      return new VideoSequelizeRepository(videoModel, uow);
    },
    inject: [getModelToken(VideoModel), 'UnitOfWork'],
  },
};

export const USE_CASES = {
  CREATE_VIDEO_USE_CASE: {
    provide: CreateVideoUseCase,
    useFactory: (
      uow: IUnitOfWork,
      videoRepo: IVideoRepository,
      categoriesIdValidator: CategoriesIdExistsInDatabaseValidator,
      genresIdValidator: GenresIdExistsInDatabaseValidator,
      castMembersIdValidator: CastMembersIdExistsInDatabaseValidator,
    ) => {
      return new CreateVideoUseCase(
        uow,
        videoRepo,
        categoriesIdValidator,
        genresIdValidator,
        castMembersIdValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR
        .provide,
      GENRES_PROVIDERS.VALIDATIONS.GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR
        .provide,
      CAST_MEMBERS_PROVIDERS.VALIDATIONS
        .CAST_MEMBERS_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
    ],
  },
  UPDATE_VIDEO_USE_CASE: {
    provide: UpdateVideoUseCase,
    useFactory: (
      uow: IUnitOfWork,
      videoRepo: IVideoRepository,
      categoriesIdValidator: CategoriesIdExistsInDatabaseValidator,
      genresIdValidator: GenresIdExistsInDatabaseValidator,
      castMembersIdValidator: CastMembersIdExistsInDatabaseValidator,
    ) => {
      return new UpdateVideoUseCase(
        uow,
        videoRepo,
        categoriesIdValidator,
        genresIdValidator,
        castMembersIdValidator,
      );
    },
    inject: [
      'UnitOfWork',
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.VALIDATIONS.CATEGORIES_IDS_EXISTS_IN_DATABASE_VALIDATOR
        .provide,
      GENRES_PROVIDERS.VALIDATIONS.GENRES_IDS_EXISTS_IN_DATABASE_VALIDATOR
        .provide,
      CAST_MEMBERS_PROVIDERS.VALIDATIONS
        .CAST_MEMBERS_IDS_EXISTS_IN_DATABASE_VALIDATOR.provide,
    ],
  },
  UPLOAD_AUDIO_VIDEO_MEDIA_USE_CASE: {
    provide: UploadAudioVideoMediasUseCase,
    useFactory: (
      appService: ApplicationService,
      videoRepo: IVideoRepository,
      storage: IStorage,
    ) => {
      return new UploadAudioVideoMediasUseCase(appService, videoRepo, storage);
    },
    inject: [
      ApplicationService,
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      'IStorage',
    ],
  },
  GET_VIDEO_USE_CASE: {
    provide: GetVideoUseCase,
    useFactory: (
      videoRepo: IVideoRepository,
      categoryRepo: ICategoryRepository,
      genreRepo: IGenreRepository,
      castMemberRepo: ICastMemberRepository,
    ) => {
      return new GetVideoUseCase(
        videoRepo,
        categoryRepo,
        genreRepo,
        castMemberRepo,
      );
    },
    inject: [
      REPOSITORIES.VIDEO_REPOSITORY.provide,
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
      CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    ],
  },
  PROCESS_AUDIO_VIDEO_MEDIA_USE_CASE: {
    provide: ProcessAudioVideoMediasUseCase,
    useFactory: (uow: IUnitOfWork, videoRepo: IVideoRepository) => {
      return new ProcessAudioVideoMediasUseCase(uow, videoRepo);
    },
    inject: ['UnitOfWork', REPOSITORIES.VIDEO_REPOSITORY.provide],
  },
};

export const LISTENERS = {
  PUBLISH_VIDEO_MEDIA_REPLACED_IN_QUEUE_HANDLER: {
    provide: PublishVideoMediaReplacedInQueueListener,
    useFactory: () => {
      return new PublishVideoMediaReplacedInQueueListener();
    },
  },
};

export const VIDEOS_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
  LISTENERS,
};
