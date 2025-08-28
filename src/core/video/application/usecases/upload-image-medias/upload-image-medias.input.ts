import {
  IsIn,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
  validateSync,
} from 'class-validator';
import { FileMediaInput } from '../common/file-media.input';

export type UploadImageMediasInputContructorProps = {
  video_id: string;
  field: 'thumbnail' | 'banner' | 'thumbnail_half';
  file: FileMediaInput;
};

export class UploadImageMediasInput {
  @IsUUID('4')
  @IsString()
  @IsNotEmpty()
  video_id: string;

  @IsIn(['thumbnail', 'banner', 'thumbnail_half'])
  @IsNotEmpty()
  field: 'thumbnail' | 'banner' | 'thumbnail_half';

  @ValidateNested()
  file: FileMediaInput;

  constructor(props: UploadImageMediasInputContructorProps) {
    if (!props) return;
    this.video_id = props.video_id;
    this.field = props.field;
    this.file = props.file;
  }
}

export class ValidateUploadImageMediasInput {
  static validate(input: UploadImageMediasInput) {
    return validateSync(input);
  }
}
