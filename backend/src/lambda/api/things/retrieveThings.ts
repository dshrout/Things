import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { getThings } from '../../../repository/thingRepo';
import { getUserFromJwt } from '../../../utilities/jwtHelper';
import { createLogger } from '../../../utilities/logger';
import { IsNullOrWhiteSpace } from '../../../utilities/stringHelper';

const logger = createLogger('Retrieve Things');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Get Things: ', event);

  const userId = getUserFromJwt(event);
  if (IsNullOrWhiteSpace(userId)) {
    return {
      statusCode: 400,
      body: 'User ID cannot be empty.'
    }
  }

  const things = await getThings(userId);

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: things
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
