import { Test, TestingModule } from '@nestjs/testing';
import { VideosModule } from '../videos.module';
import { UnitOfWorkSequelize } from '../../../core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { VIDEOS_PROVIDERS } from '../videos.providers';
import { IVideoRepository } from '../../../core/video/domain/video.repository';
import { Video } from '../../../core/video/domain/video.aggregate';
import { Category } from '../../../core/category/domain/category.aggregate';
import { Genre } from '../../../core/genre/domain/genre.aggregate';
import { CastMember } from '../../../core/cast-member/domain/cast-member.aggregate';
import { ICategoryRepository } from '../../../core/category/domain/category.repository';
import { IGenreRepository } from '../../../core/genre/domain/genre.repository';
import { ICastMemberRepository } from '../../../core/cast-member/domain/cast-member.repository';
import { getConnectionToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ChannelWrapper } from 'amqp-connection-manager';
import { ConsumeMessage } from 'amqplib';
import { ConfigModule } from 'src/nest-modules/config/config.module';
import { SharedModule } from 'src/nest-modules/shared/shared.module';
import { DatabaseModule } from 'src/nest-modules/database/database.module';
import { EventModule } from 'src/nest-modules/event/event.module';
import { RabbitmqModule } from 'src/nest-modules/rabbitmq/rabbitmq.module';
import { UseCaseModule } from 'src/nest-modules/usecase/usecase.module';
import { EVENTS_MESSAGE_BROKER_CONFIG } from '@core/shared/infra/message-broker/rabbitmq/events-message-broker-config';
import { VideoAudioMediaReplacedIntegrationEvent } from '@core/video/domain/events/video-audio-media-replaced.event';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories/categories.providers';
import { GENRES_PROVIDERS } from 'src/nest-modules/genre/genres.providers';
import { CAST_MEMBERS_PROVIDERS } from 'src/nest-modules/cast-members/cast-members.providers';
import { UploadAudioVideoMediasUseCase } from '@core/video/application/usecases/upload-audio-video-medias/upload-audio-video-media.usecase';
// import { AuthModule } from '../../auth-module/auth.module';

describe('PublishVideoMediaReplacedInQueueHandler Integration Tests', () => {
  let module: TestingModule;
  let channelWrapper: ChannelWrapper;
  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        SharedModule,
        DatabaseModule,
        EventModule,
        UseCaseModule,
        RabbitmqModule.forRoot(),
        // AuthModule,
        VideosModule,
      ],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        factory: (sequelize: Sequelize) => {
          return new UnitOfWorkSequelize(sequelize);
        },
        inject: [getConnectionToken()],
      })
      .compile();
    await module.init();

    const amqpConn = module.get<AmqpConnection>(AmqpConnection);
    channelWrapper = amqpConn.managedConnection.createChannel();
    await channelWrapper.addSetup((channel) => {
      return Promise.all([
        channel.assertQueue('test-queue-video-upload', {
          durable: false,
        }),
        channel.bindQueue(
          'test-queue-video-upload',
          EVENTS_MESSAGE_BROKER_CONFIG[
            VideoAudioMediaReplacedIntegrationEvent.name
          ].exchange,
          EVENTS_MESSAGE_BROKER_CONFIG[
            VideoAudioMediaReplacedIntegrationEvent.name
          ].routingKey,
        ),
      ]).then(() => channel.purgeQueue('test-queue-video-upload'));
    });
  });

  afterEach(async () => {
    await channelWrapper.close();
    await module.close();
  });

  it('should publish video media replaced event in queue', async () => {
    const category = Category.fake().aCategory().build();
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.category_id)
      .build();
    const castMember = CastMember.fake().aDirector().build();
    const video = Video.fake()
      .aVideoWithoutMedias()
      .addCategoryId(category.category_id)
      .addGenreId(genre.genre_id)
      .addCastMemberId(castMember.cast_member_id)
      .build();

    const categoryRepo: ICategoryRepository = module.get(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
    await categoryRepo.insert(category);

    const genreRepo: IGenreRepository = module.get(
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    );
    await genreRepo.insert(genre);

    const castMemberRepo: ICastMemberRepository = module.get(
      CAST_MEMBERS_PROVIDERS.REPOSITORIES.CAST_MEMBER_REPOSITORY.provide,
    );
    await castMemberRepo.insert(castMember);

    const videoRepo: IVideoRepository = module.get(
      VIDEOS_PROVIDERS.REPOSITORIES.VIDEO_REPOSITORY.provide,
    );
    await videoRepo.insert(video);

    const useCase: UploadAudioVideoMediasUseCase = module.get(
      VIDEOS_PROVIDERS.USE_CASES.UPLOAD_AUDIO_VIDEO_MEDIA_USE_CASE.provide,
    );

    await useCase.execute({
      video_id: video.video_id.id,
      field: 'video',
      file: {
        data: Buffer.from('data'),
        mime_type: 'video/mp4',
        raw_name: 'video.mp4',
        size: 100,
      },
    });

    const msg: ConsumeMessage = await new Promise((resolve) => {
      channelWrapper.consume('test-queue-video-upload', (msg) => {
        resolve(msg);
      });
    });

    const msgObj = JSON.parse(msg.content.toString());
    const updatedVideo = await videoRepo.findById(video.video_id);
    expect(msgObj).toEqual({
      resource_id: `${video.video_id.id}.video`,
      file_path: updatedVideo?.video?.raw_url,
    });
  });
});
