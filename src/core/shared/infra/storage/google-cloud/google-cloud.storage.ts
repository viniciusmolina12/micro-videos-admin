import { IStorage } from '@core/shared/application/storage.interface';
import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';

export class GoogleCloudStorage implements IStorage {
  constructor(
    private readonly storageSdk: GoogleCloudStorageSdk,
    private readonly bucketName: string,
  ) {}

  async store(object: {
    data: Buffer;
    mime_type: string;
    id: string;
  }): Promise<void> {
    const bucket = this.storageSdk.bucket(this.bucketName);
    const file = bucket.file(object.id);
    await file.save(object.data, {
      metadata: {
        contentType: object.mime_type,
      },
    });
  }

  async get(id: string): Promise<{ data: Buffer; mime_type?: string }> {
    const bucket = this.storageSdk.bucket(this.bucketName);
    const file = bucket.file(id);
    const [buffer] = await file.download();
    const metadata = await file.getMetadata();
    return { data: buffer, mime_type: metadata[0].contentType };
  }
}
