import { IIntegrationEventListener } from '@core/shared/application/domain-event-listener.interface';
import { VideoAudioMediaReplacedIntegrationEvent } from '../../domain/events/video-audio-media-replaced.event';
import { OnEvent } from '@nestjs/event-emitter';

export class PublishVideoMediaReplacedInQueueListener
  implements IIntegrationEventListener
{
  @OnEvent(VideoAudioMediaReplacedIntegrationEvent.name)
  async handle(event: VideoAudioMediaReplacedIntegrationEvent): Promise<void> {
    console.log(event);
  }
}
