require('dotenv').config();

module.exports = {
  PORT: process.env.PORT,
  AWS_REGION: process.env.AWS_REGION,
  MONGODB_URI: process.env.MONGODB_URI,
  SQS_QUEUE_URL: process.env.SQS_QUEUE_URL,
  SQS_QUEUE_ARN: process.env.SQS_QUEUE_ARN,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  S3_BUCKET_ARN: process.env.S3_BUCKET_ARN,
  S3_URI_BUCKET: process.env.S3_URI_BUCKET,
  COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
};
