const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');
const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN, S3_BUCKET_NAME } = require('../utils/env');

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    sessionToken: AWS_SESSION_TOKEN
  }
});

const corsConfig = {
  Bucket: S3_BUCKET_NAME,
  CORSConfiguration: {
    CORSRules: [
      { AllowedHeaders: ['*'], AllowedMethods: ['GET', 'PUT', 'POST'], AllowedOrigins: ['*'], ExposedHeaders: ['ETag'], MaxAgeSeconds: 3000 }
    ]
  }
};

(async () => {
  try {
    await s3Client.send(new PutBucketCorsCommand(corsConfig));
    console.log('✅ CORS configurado com sucesso no bucket S3!');
  } catch (err) {
    console.error(`❌ Erro ao configurar o CORS: ${err}`);
  }
})();
