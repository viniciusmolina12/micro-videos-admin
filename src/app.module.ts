import { Module } from '@nestjs/common';
import { CategoriesModule } from './nest-modules/categories/categories.module';
import { DatabaseModule } from './nest-modules/database/database.module';
import { ConfigModule } from './nest-modules/config/config.module';
import { SharedModule } from './nest-modules/shared/shared.module';
import { GenresModule } from './nest-modules/genre/genres.module';
import { CastMembersModule } from './nest-modules/cast-members/cast-member.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    GenresModule,
    CastMembersModule,
    CategoriesModule,
    ConfigModule,
    SharedModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
