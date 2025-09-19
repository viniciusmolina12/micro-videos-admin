import { IIntegrationEventListener } from '@core/shared/application/domain-event-listener.interface';
import { VideoAudioMediaReplacedIntegrationEvent } from '../../domain/events/video-audio-media-replaced.event';
import { OnEvent } from '@nestjs/event-emitter';
import { IMessageBroker } from '@core/shared/application/message-broker.interface';

export class PublishVideoMediaReplacedInQueueListener
  implements IIntegrationEventListener
{
  constructor(private readonly messageBroker: IMessageBroker) {}

  @OnEvent(VideoAudioMediaReplacedIntegrationEvent.name)
  async handle(event: VideoAudioMediaReplacedIntegrationEvent): Promise<void> {
    await this.messageBroker.publishEvent(event);
  }
}
