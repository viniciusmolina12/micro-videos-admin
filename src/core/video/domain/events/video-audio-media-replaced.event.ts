import { IDomainEvent } from '@core/shared/domain/events/domain-event.interface';
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
}
