const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const authenticate = require('../config/authMiddleware');

jest.mock('jsonwebtoken');
jest.mock('jwks-rsa');

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: { authorization: 'Bearer valid.token.here' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();

    // mocka o retorno de getSigningKey
    jwksClient.mockReturnValue({ getSigningKey: (_, cb) => cb(null, { getPublicKey: () => 'public-key-mock' }) });
  });

  test('✅ Deve permitir acesso com token válido e clientId correto', () => {});
});
