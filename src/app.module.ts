import { Module } from '@nestjs/common';
import { CategoriesModule } from './nest-modules/categories/categories.module';
import { DatabaseModule } from './nest-modules/database/database.module';
import { ConfigModule } from './nest-modules/config/config.module';
import { SharedModule } from './nest-modules/shared/shared.module';
import { GenresModule } from './nest-modules/genre/genres.module';
import { CastMembersModule } from './nest-modules/cast-members/cast-member.module';
import { VideosModule } from './nest-modules/videos-module/videos.module';
import { EventModule } from './nest-modules/event/event.module';
import { UseCaseModule } from './nest-modules/usecase/usecase.module';
import { RabbitMQFakeConsumer } from './nest-modules/rabbitmq-fake.consumer';
import { RabbitmqModule } from './nest-modules/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SharedModule,
    DatabaseModule,
    EventModule,
    UseCaseModule,
    CategoriesModule,
    CastMembersModule,
    GenresModule,
    VideosModule,
    // RabbitMQModule.forRoot({
    //   uri: 'amqp://admin:admin@localhost:5672',
    // }),
    RabbitmqModule.forRoot(),
  ],
  controllers: [],
  providers: [RabbitMQFakeConsumer],
})
export class AppModule {}
