import { Config } from '../../config';
import { GoogleCloudStorage } from './google-cloud.storage';
import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';

describe('GoogleCloudStorage Unit Tests', () => {
  let googleCloudStorage: GoogleCloudStorage;
  let storageSdk: GoogleCloudStorageSdk;

  beforeEach(() => {
    storageSdk = new GoogleCloudStorageSdk({
      credentials: Config.googleCloudCredentials(),
    });
    const bucketName = Config.bucketName();
    googleCloudStorage = new GoogleCloudStorage(storageSdk, bucketName);
  });
  it('should store a file', async () => {
    const saveMock = jest
      .fn()
      .mockImplementation(() => Promise.resolve(undefined));
    const fileMock = jest.fn().mockImplementation(() => ({
      save: saveMock,
    }));
    jest.spyOn(storageSdk, 'bucket').mockImplementation(
      () =>
        ({
          file: fileMock,
        }) as any,
    );

    await googleCloudStorage.store({
      data: Buffer.from('test'),
      mime_type: 'text/plain',
      id: 'test.txt',
    });

    expect(storageSdk.bucket).toHaveBeenCalledTimes(1);
    expect(storageSdk.bucket).toHaveBeenCalledWith(Config.bucketName());
    expect(fileMock).toHaveBeenCalledTimes(1);
    expect(fileMock).toHaveBeenCalledWith('test.txt');
    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledWith(Buffer.from('test'), {
      metadata: {
        contentType: 'text/plain',
      },
    });
  });

  it('should get a file', async () => {
    const getMetadataMock = jest.fn().mockResolvedValue(
      Promise.resolve([
        {
          contentType: 'text/plain',
          name: 'location/1.txt',
        },
      ]),
    );
    const downloadMock = jest
      .fn()
      .mockResolvedValue(Promise.resolve([Buffer.from('data')]));
    const fileMock = jest.fn().mockImplementation(() => ({
      getMetadata: getMetadataMock,
      download: downloadMock,
    }));
    jest.spyOn(storageSdk, 'bucket').mockImplementation(
      () =>
        ({
          file: fileMock,
        }) as any,
    );

    const result = await googleCloudStorage.get('location/1.txt');
    expect(storageSdk.bucket).toHaveBeenCalledWith(Config.bucketName());
    expect(fileMock).toHaveBeenCalledWith('location/1.txt');
    expect(getMetadataMock).toHaveBeenCalled();
    expect(downloadMock).toHaveBeenCalled();
    expect(result).toEqual({
      data: Buffer.from('data'),
      mime_type: 'text/plain',
    });
  });
});
