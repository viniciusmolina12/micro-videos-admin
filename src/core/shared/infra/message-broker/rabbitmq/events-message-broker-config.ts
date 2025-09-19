import { VideoAudioMediaReplacedIntegrationEvent } from '@core/video/domain/events/video-audio-media-replaced.event';

export const EVENTS_MESSAGE_BROKER_CONFIG = {
  [VideoAudioMediaReplacedIntegrationEvent.name]: {
    exchange: 'amq.direct',
    routingKey: VideoAudioMediaReplacedIntegrationEvent.name,
  },
  TestEvent: {
    exchange: 'test-exchange',
    routingKey: 'TestEvent',
  },
};
