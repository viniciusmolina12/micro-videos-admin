import { Either } from '@core/shared/domain/either';
import { MediaFileValidator } from '@core/shared/domain/validators/media-file.validator';
import { ImageMedia } from '@core/shared/domain/value-objects/image-media.vo';
import { VideoId } from './video.aggregate';

export class Banner extends ImageMedia {
  static max_size = 1024 * 1024 * 2; // 2MB
  static mime_types = ['image/jpeg', 'image/png', 'image/gif'];

  static createFromFile({
    raw_name,
    mime_type,
    size,
    video_id,
  }: {
    raw_name: string;
    mime_type: string;
    size: number;
    video_id: VideoId;
  }) {
    const validator = new MediaFileValidator(
      Banner.max_size,
      Banner.mime_types,
    );
    return Either.safe(() => {
      const { name } = validator.validate({
        raw_name,
        mime_type,
        size,
      });
      return new Banner({
        name,
        location: `videos/${video_id.id}/images`,
      });
    });
  }
}
