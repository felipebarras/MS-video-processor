const { generatePresignedUrl } = require('../utils/s3.client');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

jest.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl: jest.fn() }));

describe('generatePresignedUrl', () => {
  it('Deve gerar o presigned link para PUT', async () => {
    getSignedUrl.mockResolvedValue('https://test-url-upload');

    const result = await generatePresignedUrl('video-felipe.mp4', 'putObject');

    expect(result).toHaveBeenCalledWith({
      Bucket: expect.any(String),
      Key: 'videos/video-felipe.mp4'
    });
    expect(getSignedUrl).toHaveBeenCalled();
    expect(result).toBe('https://test-url-upload');
  });
});
