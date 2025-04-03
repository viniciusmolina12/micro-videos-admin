import { Module } from '@nestjs/common';
import { CollectionPresenter } from './collection.presenter';

@Module({
  exports: [CollectionPresenter],
})
export class SharedModule {}
