import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import 'source-map-support/register';
import { verify } from 'jsonwebtoken';
import { createLogger } from '../../utils/logger';
import Axios from 'axios';
import { JwtPayload } from '../../models/JwtPayload';

const logger = createLogger('authorizer');

const jwksUrl = 'https://dev-5muo48qz.us.auth0.com/.well-known/jwks.json';

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken);
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info('User was authorized', jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader);
  let cert: string = '';

  try {
    const jwksData = await Axios.get(jwksUrl);
    const certKey = jwksData['data']['keys'][0]['x5c'][0];
    cert = `-----BEGIN CERTIFICATE-----\n${certKey}\n-----END CERTIFICATE-----`;
  } catch (ex) {
    logger.info('Error getting JWKS data: ', ex);
  }

  return verify(token, cert, {algorithms: ['RS256']}) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) {
    throw new Error('No authentication header');
  }

  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authentication header');
  }

  const token = authHeader.split(' ')[1];

  return token;
}
