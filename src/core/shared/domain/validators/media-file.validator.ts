import crypto from 'crypto';

export class MediaFileValidator {
  constructor(
    private readonly max_size: number,
    private readonly valid_mime_types: string[],
  ) {}

  validate({
    raw_name,
    mime_type,
    size,
  }: {
    raw_name: string;
    mime_type: string;
    size: number;
  }) {
    if (!this.validateSize(size)) {
      throw new InvalidMediaFileSizeError(size, this.max_size);
    }

    if (!this.validateMimeType(mime_type)) {
      throw new InvalidMediaFileMimeTypeError(mime_type, this.valid_mime_types);
    }

    return {
      name: this.generateRandomName(raw_name),
    };
  }

  private validateSize(size: number) {
    return size <= this.max_size;
  }

  private validateMimeType(mime_type: string) {
    return this.valid_mime_types.includes(mime_type);
  }

  private generateRandomName(raw_name: string) {
    const extension = raw_name.split('.').pop();
    return (
      crypto
        .createHash('256')
        .update(raw_name + Math.random() + Date.now())
        .digest('hex') +
      '.' +
      extension
    );
  }
}

export class InvalidMediaFileSizeError extends Error {
  constructor(actual_size: number, max_size: number) {
    super(`Invalid media file size: ${actual_size} > ${max_size}`);
    this.name = 'InvalidMediaFileSizeError';
  }
}

export class InvalidMediaFileMimeTypeError extends Error {
  constructor(mime_type: string, valid_mime_types: string[]) {
    super(
      `Invalid media file mime type: ${mime_type} not in ${valid_mime_types.join(
        ', ',
      )}`,
    );
    this.name = 'InvalidMediaFileMimeTypeError';
  }
}
