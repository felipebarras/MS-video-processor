require('dotenv').config();

module.exports = {
  PORT: process.env.PORT,
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_SESSION_TOKEN: process.env.AWS_SESSION_TOKEN,
  FRAME_PROCESSOR_API_URL: process.env.FRAME_PROCESSOR_API_URL,
  MONGODB_URI: process.env.MONGODB_URI,
  SQS_QUEUE_URL: process.env.SQS_QUEUE_URL,
  SQS_QUEUE_ARN: process.env.SQS_QUEUE_ARN,
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  S3_BUCKET_ARN: process.env.S3_BUCKET_ARN,
  S3_URI_BUCKET: process.env.S3_URI_BUCKET
};
