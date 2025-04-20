const { generatePresignedUrl } = require('../utils/s3.client');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

<<<<<<< HEAD
jest.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl: jest.fn().mockResolvedValue('https://test-url-upload') }));

jest.mock('@aws-sdk/client-s3', () => {
  const PutObjectCommand = jest.fn((params) => params);
  const GetObjectCommand = jest.fn((params) => params);

  return { S3Client: jest.fn().mockImplementation(() => ({ send: jest.fn() })), PutObjectCommand, GetObjectCommand };
=======
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://mock-url-upload')
}));

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn(() => ({ send: jest.fn() })),
    PutObjectCommand: jest.fn((params) => params),
    GetObjectCommand: jest.fn((params) => params)
  };
>>>>>>> feature/configure-auth
});

describe('generatePresignedUrl', () => {
  test('Deve gerar o presigned link para PUT', async () => {
<<<<<<< HEAD
    const url = await generatePresignedUrl('felipe-video.mp4', 'putObject');

    expect(PutObjectCommand).toHaveBeenCalledWith({ Bucket: expect.any(String), Key: 'videos/felipe-video.mp4' });
    expect(getSignedUrl).toHaveBeenCalled();
    expect(url).toBe('https://test-url-upload');
  });

  test('Deve gerar o presigned link para GET', async () => {
    const url = await generatePresignedUrl('felipe-video.mp4', 'getObject');

    expect(GetObjectCommand).toHaveBeenCalledWith({
=======
    const url = await generatePresignedUrl('video-felipe.mp4', 'putObject');

    expect(PutObjectCommand).toHaveBeenCalledWith({
>>>>>>> feature/configure-auth
      Bucket: expect.any(String),
      Key: 'felipe-video.mp4'
    });
    expect(getSignedUrl).toHaveBeenCalled();
<<<<<<< HEAD
    expect(url).toBe('https://test-url-upload');
  });

  test('Deve usar PUT como default quando action não é passado', async () => {
    const url = await generatePresignedUrl('felipe-video.mp4');

    expect(PutObjectCommand).toHaveBeenCalledWith({ Bucket: expect.any(String), Key: 'videos/felipe-video.mp4' });
    expect(url).toBe('https://test-url-upload');
=======
    expect(url).toBe('https://mock-url-upload');
  });

  test('Deve gerar o presigned link para GET', async () => {
    const url = await generatePresignedUrl('video-felipe.mp4', 'getObject');

    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: expect.any(String),
      Key: 'videos/video-felipe.mp4'
    });
    expect(getSignedUrl).toHaveBeenCalled();
    expect(url).toBe('https://mock-url-upload');
>>>>>>> feature/configure-auth
  });
});
