import axios from 'axios';
import jwt from 'jsonwebtoken';
import jwtDecode from 'jwt-decode';
import jwkToPem from 'jwk-to-pem';

// AWS configuration variables
const aws = {
  region: 'ap-northeast-1',
  userPoolId: 'ap-northeast-1_cCS5gSeUQ',
};

// return the list of JWKs used by AWS Cognito
const fetch = (async () => {
  const url = `https://cognito-idp.${aws.region}.amazonaws.com/${aws.userPoolId}/.well-known/jwks.json`;
  const response = await axios(url);
  if (response.status !== 200) {
    return null;
  }
  return response.data.keys;
})();

// verify an AWS Cognito JWT
// https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html
function verifyToken(token, keys) {
  try {
    const header = jwtDecode(token, { header: true });
    const pem = jwkToPem(keys.find((jwk) => jwk.kid === header.kid));
    const payload = jwt.verify(token, pem, {
      algorithms: ['RS256'],
      audience: '6uepkp04av1if5mrjhndsh59aa',
      issuer: `https://cognito-idp.${aws.region}.amazonaws.com/${aws.userPoolId}`,
    });
    if (payload.token_use !== 'id') {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// perform header authorization for each request made
// if successful, a username is added to the Apollo context
export default async function context({ req }) {
  const token = req.headers.authorization;
  const keys = await fetch;
  if (token == null || keys == null) {
    return {};
  }
  const payload = verifyToken(token, keys);
  if (payload == null) {
    return {};
  }
  return { username: payload['cognito:username'] };
}
