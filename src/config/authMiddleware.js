const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const { AWS_REGION, COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID } = require('../utils/env');

const region = AWS_REGION;
const userPoolId = COGNITO_USER_POOL_ID;
const clientId = COGNITO_CLIENT_ID;

const iss = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

const client = jwksClient({
  jwksUri: `${iss}/.well-known/jwks.json`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Expecting "Bearer <token>"
  if (!token) return res.status(401).json({ message: 'Token not provided' });

  jwt.verify(token, getKey, {
    issuer: iss,
    algorithms: ['RS256']
  }, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token', error: err });

    if (decoded.client_id !== clientId) {
      return res.status(403).json({ message: 'Invalid audience' });
    }

    req.user = decoded; // Contains user sub, email, custom attributes etc.
    next();
  });
};

module.exports = authenticate;
