import { Injectable, ValidationPipe } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ProcessAudioVideoMediasInput } from '@core/video/application/usecases/process-audio-video-medias/process-audio-video-medias.input';
import { AudioVideoMediaStatus } from '@core/shared/domain/value-objects/audio-video-media.vo';
import { ProcessAudioVideoMediasUseCase } from '@core/video/application/usecases/process-audio-video-medias/process-audio-video-medias.usecase';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class VideosConsumers {
  constructor(private moduleRef: ModuleRef) {}
  @RabbitSubscribe({
    exchange: 'amq.direct',
    routingKey: 'videos.convert',
    queue: 'micro-videos/admin',
    allowNonJsonMessages: true,
  })
  async onProcessVideo(msg: {
    video: {
      resource_id: string;
      encoded_video_folder: string;
      status: 'COMPLETED' | 'FAILED';
    };
  }) {
    const resource_id = msg.video?.resource_id || '';
    const [video_id, field] = resource_id.split('.');
    const input = new ProcessAudioVideoMediasInput({
      video_id,
      encoded_location: msg.video?.encoded_video_folder || '',
      field: field as 'trailer' | 'video',
      status: msg.video?.status as AudioVideoMediaStatus,
    });

    try {
      const processAudioVideoMediasUseCase = await this.moduleRef.resolve(
        ProcessAudioVideoMediasUseCase,
      );
      await new ValidationPipe({
        errorHttpStatusCode: 422,
      }).transform(input, {
        metatype: ProcessAudioVideoMediasInput,
        type: 'body',
      });
      await processAudioVideoMediasUseCase.execute(input);
    } catch (error) {
      console.log('error', error);
    }
  }
}
