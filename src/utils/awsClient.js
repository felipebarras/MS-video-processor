const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');
// const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN, SQS_QUEUE_URL } = require('./env');
const { AWS_REGION, SQS_QUEUE_URL } = require('./env');

const sqsClient = new SQSClient({
  region: AWS_REGION,
  // credentials: {
  //   accessKeyId: AWS_ACCESS_KEY_ID,
  //   secretAccessKey: AWS_SECRET_ACCESS_KEY,
  //   sessionToken: AWS_SESSION_TOKEN
  // }
});

async function sendMessageToQueue(messageBody) {
  const params = {
    QueueUrl: SQS_QUEUE_URL,
    MessageBody: JSON.stringify(messageBody)
  };

  try {
    const command = new SendMessageCommand(params);
    const result = await sqsClient.send(command);
    console.log(`✅ Mensagem enviada para a fila SQS: ${result.MessageId}`);

    return result;
  } catch (err) {
    console.error(`❌ Erro ao enviar mensagem para a fila SQS: ${err}`);
    throw err;
  }
}

module.exports = { sendMessageToQueue };
