const { sendMessageToQueue } = require('../utils/awsClient');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

jest.mock('@aws-sdk/client-sqs', () => {
  const sendMock = jest.fn();
  return {
    SQSClient: jest.fn(() => ({ send: sendMock })),
    SendMessageCommand: jest.fn(),
    __mocks__: { sendMock }
  };
});

describe('SendMessageToQueue', () => {
  const { __mocks__ } = require('@aws-sdk/client-sqs');
  const mockSend = __mocks__.sendMock;

  beforeEach(() => jest.clearAllMocks());

  it('Deve enviar uma mensagem para a fila SQS com sucesso', async () => {
    mockSend.mockResolvedValue({ MessageId: '123' });

    const messageBody = { type: 'PROCESS_VIDEO', frameId: 'abc123' };
    const result = await sendMessageToQueue(messageBody);

    expect(result.MessageId).toBe('123');
  });

  it('Deve lançar erro ao falhar envio para SQS', async () => {
    mockSend.mockRejectedValue(new Error('Erro de envio'));

    await expect(sendMessageToQueue({ frameId: 'abc123' })).rejects.toThrow('Erro de envio');
  });
});
