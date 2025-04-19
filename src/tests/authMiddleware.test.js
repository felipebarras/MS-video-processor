const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const authenticate = require('../config/authMiddleware');
const { COGNITO_CLIENT_ID } = require('../utils/env');

jest.mock('jsonwebtoken');
jest.mock('jwks-rsa');

describe('authMiddleware', () => {
  let req, res, next;
  const client_id = COGNITO_CLIENT_ID;

  beforeEach(() => {
    req = { headers: { authorization: 'Bearer valid.token.here' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();

    // mocka o retorno de getSigningKey
    jwksClient.mockReturnValue({ getSigningKey: (_, cb) => cb(null, { getPublicKey: () => 'public-key-mock' }) });
  });

  test('✅ Deve permitir acesso com token válido e clientId correto', () => {
    jwksClient.verify.mockImplementation((token, getKey, options, cb) => cb(null, { client_id, sub: 'user-id' }));

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  test('❌ Deve retornar 401 se o token não for fornecido', async () => {
    req.headers.authorization = null;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token não fornecido' });
    expect(next).not.toHaveBeenCalled();
  });

  test('❌ Deve retornar um 401 se o token for inválido', async () => {
    jwt.verify.mockImplementation((token, getKey, options, cb) => cb(new Error('Token inválido ou expirado')));

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido ou expirado' });
  });

  test('❌ Deve retornar um 403 se o client_id for inválido', async () => {
    jwt.verify.mockImplementation((token, getKey, options, cb) => cb(null, { client_id: 'CLIENTE_INVALIDO' }));

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Cliente inválido' });
  });
});
