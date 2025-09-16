import { IDomainEventListener } from '@core/shared/application/domain-event-listener.interface';
import { VideoAudioMediaReplaced } from '../../domain/events/video-audio-media-replaced.event';
import { OnEvent } from '@nestjs/event-emitter';

export class PublishVideoMediaReplacedInQueueListener
  implements IDomainEventListener
{
  @OnEvent(VideoAudioMediaReplaced.name)
  async handle(event: VideoAudioMediaReplaced): Promise<void> {
    console.log(event);
  }
}
