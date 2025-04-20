<<<<<<< HEAD
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
=======
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
>>>>>>> feature/configure-auth

  test('Deve enviar uma mensagem para a fila SQS com sucesso', async () => {
    mockSend.mockResolvedValue({ MessageId: '123' });

<<<<<<< HEAD
    const result = await sendMessageToQueue({ frameId: 'abc123', status: 'upload_feito' });

    expect(mockSend).toHaveBeenCalled();
=======
>>>>>>> feature/configure-auth
    expect(result.MessageId).toBe('123');
  });

  it('Deve lançar erro ao falhar envio para SQS', async () => {
    mockSend.mockRejectedValue(new Error('Erro de envio'));

    await expect(sendMessageToQueue({ frameId: 'abc123' })).rejects.toThrow('Erro de envio');
<<<<<<< HEAD
    expect(mockSend).toHaveBeenCalled();
=======
>>>>>>> feature/configure-auth
  });
});
