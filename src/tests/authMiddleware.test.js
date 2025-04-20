const jwt = require('jsonwebtoken');
const authenticate = require('../config/authMiddleware');

jest.mock('jsonwebtoken');

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: { authorization: 'Bearer valid.token.here' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  test('✅ Deve permitir acesso com token válido e clientId correto', () => {
    jwt.verify.mockImplementation((token, getKey, options, callback) => {
      callback(null, { client_id: process.env.COGNITO_CLIENT_ID || 'mock-client-id', sub: 'abc123' });
    });

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  test('❌ Deve retornar 401 se o token não for fornecido', () => {
    req.headers.authorization = null;

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token não fornecido' });
  });

  test('❌ Deve retornar 401 se o token for inválido', () => {
    jwt.verify.mockImplementation((token, getKey, options, callback) => {
      callback(new Error('invalid'), null);
    });

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido ou expirado' });
  });

  test('❌ Deve retornar 403 se o client_id for inválido', () => {
    jwt.verify.mockImplementation((token, getKey, options, callback) => {
      callback(null, { client_id: 'wrong-client-id' });
    });

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Cliente inválido' });
  });
});
