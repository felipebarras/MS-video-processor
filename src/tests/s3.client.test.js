const { generatePresignedUrl } = require('../utils/s3.client');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://mock-url-upload')
}));

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn(() => ({ send: jest.fn() })),
    PutObjectCommand: jest.fn((params) => params),
    GetObjectCommand: jest.fn((params) => params)
  };
});

describe('generatePresignedUrl', () => {
  test('Deve gerar o presigned link para PUT', async () => {
    const url = await generatePresignedUrl('felipe-video.mp4', 'putObject');

    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: expect.any(String),
      Key: 'videos/felipe-video.mp4'
    });
    expect(getSignedUrl).toHaveBeenCalled();
    expect(url).toBe('https://mock-url-upload');
  });

  test('Deve gerar o presigned link para GET', async () => {
    const url = await generatePresignedUrl('felipe-video.mp4', 'getObject');

    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: expect.any(String),
      Key: 'videos/felipe-video.mp4'
    });
    expect(getSignedUrl).toHaveBeenCalled();
    expect(url).toBe('https://mock-url-upload');
  });
});
