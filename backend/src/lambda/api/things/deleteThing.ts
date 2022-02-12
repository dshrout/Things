import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { getThingById, deleteThing } from '../../../repository/thingRepo';
import { getUserFromJwt } from '../../../utils/jwtHelper';
import { createLogger } from '../../../utils/logger';
import { IsNullOrWhiteSpace } from '../../../utils/stringHelper';

const logger = createLogger('Delete Thing');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Delete Thing: ', event);

  const userId = getUserFromJwt(event)
  const thingId = event.pathParameters.id
  if (IsNullOrWhiteSpace(userId) || IsNullOrWhiteSpace(thingId)) {
    return {
      statusCode: 400,
      body: 'One or more items are empty.'
    }
  }

  const thing = await getThingById(userId, thingId);
  if (IsNullOrWhiteSpace(thing.name)) {
    logger.info('HTTP 404 - thingId ' + thingId + ' not found for user ' + userId);
    return {
      statusCode: 404,
      body: 'Item not found.'
    }
  }

  await deleteThing(userId, thingId);
  return {
    statusCode: 204,
    body: ''
  }
})

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
