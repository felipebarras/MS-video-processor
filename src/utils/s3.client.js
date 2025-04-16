const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN, S3_BUCKET_NAME } = require('../utils/env');

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    sessionToken: AWS_SESSION_TOKEN
  }
});

exports.generatePresignedUrl = async (key, action = 'putObject') => {
  const objectKey = `videos/${key}`;

  const command =
    action === 'getObject' ? new GetObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key }) : new PutObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key });

  return getSignedUrl(s3, command, { expiresIn: 3600 });
};
