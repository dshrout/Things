import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { getThingById, updateThing } from '../../repository/thingRepo';
import { Thing } from '../../models/Thing';
import { getUserFromJwt } from '../../utils/jwtHelper';
import { createLogger } from '../../utils/logger';
import { IsNullOrWhiteSpace } from '../../utils/stringHelper';

const logger = createLogger('Update Thing');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Update Thing: ', event);

  const newThing: Thing = JSON.parse(event.body)
  newThing.userId = getUserFromJwt(event)

  if (!ValidateRequest(newThing)) {
    return {
      statusCode: 400,
      body: 'Missing required field.'
    }
  }

  const oldThing = await getThingById(newThing.userId, newThing.id);
  if (IsNullOrWhiteSpace(oldThing.name)) {
    logger.info('HTTP 404 - Thing with id ' + oldThing.id + ' not found for user ' + oldThing.userId);
    return {
      statusCode: 404,
      body: 'Item not found.'
    }
  }

  const items = await updateThing(newThing);
  return {
    statusCode: 200,
    body: JSON.stringify({
      items
    })
  }
})

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )

function ValidateRequest(thing: Thing): boolean {
  if(IsNullOrWhiteSpace(thing.userId)) {
    return false;
  }
  return true;
}