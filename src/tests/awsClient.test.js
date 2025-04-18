jest.mock('@aws-sdk/client-sqs', () => {
  const sendMock = jest.fn();
  const SQSClient = jest.fn(() => ({ send: sendMock }));

  return {
    SQSClient,
    SendMessageCommand: jest.fn().mockImplementation((params) => params),
    __esModule: true,
    mockSend: sendMock
  };
});

const { mockSend } = require('@aws-sdk/client-sqs');
const { sendMessageToQueue } = require('../utils/awsClient');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

describe('SendMessageToQueue', () => {
  afterEach(() => jest.clearAllMocks());

  test('Deve enviar uma mensagem para a fila SQS com sucesso', async () => {
    mockSend.mockResolvedValue({ MessageId: '123' });

    const result = await sendMessageToQueue({ frameId: 'abc123', status: 'upload_feito' });

    expect(mockSend).toHaveBeenCalled();
    expect(result.MessageId).toBe('123');
  });

  it('Deve lançar erro ao falhar envio para SQS', async () => {
    mockSend.mockRejectedValue(new Error('Erro de envio'));

    await expect(sendMessageToQueue({ frameId: 'abc123' })).rejects.toThrow('Erro de envio');
    expect(mockSend).toHaveBeenCalled();
  });
});
