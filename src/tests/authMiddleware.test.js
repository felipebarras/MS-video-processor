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

  test('✅ Deve permitir acesso com token válido e clientId correto', () => {
    jwksClient.mockImplementation((token, keyGetter, options, cb) => cb(null, { client_id: '2o0ul3o15gc83uido9o2djt06l', sub: 'user-id' }));

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  test('❌ Deve retornar 401 se o token não for fornecido', async () => {
    req.headers.authorization = null;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token not provided' });
    expect(next).not.toHaveBeenCalled();
  });

  test('❌ Deve retornar um 403 se o token fornecido for inválido', async () => {
    jwt.verify.mockImplementation((token, keyGetter, options, cb) => cb(null, { client_id: 'CLIENTE_ERROU' }));

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
  });
});
