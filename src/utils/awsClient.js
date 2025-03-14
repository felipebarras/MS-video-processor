const AWS = require('aws-sdk');
require('dotenv').config();

// configueração do AWS SDK
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

module.exports = {
  sendMessageToQueue: async (messageBody) => {
    const queueUrl = process.env.SQS_QUEUE_URL;

    const params = { MessageBody: JSON.stringify(messageBody), QueueUrl: queueUrl };

    try {
      const result = await sqs.sendMessage(params).promise();
      console.log(`✅ Mensagem enviada para a fila SQS: ${JSON.stringify(messageBody)}`);

      return result;
    } catch (err) {
      console.error(`❌ Erro ao enviar mensagem para a fila SQS: ${err}`);
      throw err;
    }
  }
};
