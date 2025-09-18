import {
  IDomainEvent,
  IIntegrationEvent,
} from '@core/shared/domain/events/domain-event.interface';
import { VideoMedia } from '../video-media.vo';
import { VideoId } from '../video.aggregate';
import { Trailer } from '../trailer.vo';

export type VideoAudioMediaReplacedProps = {
  video_id: VideoId;
  media: Trailer | VideoMedia;
  media_type: 'trailer' | 'video';
};

export class VideoAudioMediaReplaced implements IDomainEvent {
  readonly aggregate_id: VideoId;
  readonly occurred_on: Date;
  readonly event_version: number;

  readonly media: Trailer | VideoMedia;
  readonly media_type: 'trailer' | 'video';

  constructor(props: VideoAudioMediaReplacedProps) {
    this.aggregate_id = props.video_id;
    this.occurred_on = new Date();
    this.event_version = 1;
    this.media = props.media;
    this.media_type = props.media_type;
  }

  getIntegrationEvent(): IIntegrationEvent {
    return new VideoAudioMediaReplacedIntegrationEvent(this);
  }
}

export class VideoAudioMediaReplacedIntegrationEvent
  implements IIntegrationEvent<VideoAudioMediaReplaced>
{
  occurred_on: Date;
  event_version: number;
  payload: any;
  event_name: string;

  constructor(event: VideoAudioMediaReplaced) {
    this.occurred_on = event.occurred_on;
    this.event_version = event.event_version;
    this.payload = {
      video_id: event.aggregate_id.id,
      media: event.media.toJSON(),
      media_type: event.media_type,
    };
    this.event_name = this.constructor.name;
  }
}
