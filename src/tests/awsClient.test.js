const { sendMessageToQueue } = require('../utils/awsClient');
const { SQSClient, SendMessageBatchCommand } = require('@aws-sdk/client-sqs');

jest.mock('@aws-sdk/client-sqs');

describe('SendMessageToQueue', () => {
  it('Deve enviar uma mensagem para a fila SQS com sucesso', async () => {
    const mockSend = jest.fn().mockResolvedValue({ MessageId: '123' });
    SQSClient.mockImplementation(() => ({ send: mockSend }));

    const messageBody = { type: 'PROCESS_VIDEO', frameId: 'abc123' };
    const result = await sendMessageToQueue(messageBody);

    expect(mockSend).toHaveBeenCalledWith(expect.any(SendMessageBatchCommand));
    expect(result.MessageId).toBe('123');
  });

  it('Deve lançar erro ao falhar envio para SQS', async () => {
    const mockSend = jest.fn().mockRejectedValue(new Error('Erro de envio'));
    SQSClient.mockImplementation(() => ({ send: mockSend }));

    await expect(sendMessageToQueue({})).rejects.toThrow('Erro de envio');
  });
});
