import { VideoAudioMediaReplaced } from '@core/video/domain/events/video-audio-media-replaced.event';

export const EVENTS_MESSAGE_BROKER_CONFIG = {
  [VideoAudioMediaReplaced.name]: {
    exchange: 'amq.direct',
    routingKey: VideoAudioMediaReplaced.name,
  },
  TestEvent: {
    exchange: 'test-exchange',
    routingKey: 'TestEvent',
  },
};
