const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { AWS_REGION, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } = require('../utils/env');

const iss = `https://cognito-idp.${AWS_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}`;

const client = jwksClient({ jwksUri: `${iss}/.well-known/jwks.json` });

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  jwt.verify(token, getKey, { issuer: iss, algorithms: ['RS256'] }, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token inválido ou expirado' });
    if (decoded.client_id !== COGNITO_CLIENT_ID) return res.status(403).json({ message: 'Cliente inválido' });

    req.user = decoded;
    next();
  });
};

module.exports = authenticate;
