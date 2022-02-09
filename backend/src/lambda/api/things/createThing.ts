import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { Thing } from '../../../models/Thing';
import { getUserFromJwt } from '../../../utils/jwtHelper';
import { createThing } from '../../../repository/thingRepo';
import { createLogger } from '../../../utils/logger';
import { IsNullOrWhiteSpace } from '../../../utils/stringHelper';

const logger = createLogger('createThing');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Create Thing: ', event);

  const newThing: Thing = JSON.parse(event.body);
  newThing.userId = getUserFromJwt(event);

  if (!ValidateRequest(newThing)) {
    return {
      statusCode: 400,
      body: 'One or more required fields are empty.'
    }
  }

  const item = await createThing(newThing);

  return {
    statusCode: 201,
    body: JSON.stringify({
      item
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)

function ValidateRequest(thing: Thing): boolean {
  if(IsNullOrWhiteSpace(thing.userId) || IsNullOrWhiteSpace(thing.category) || IsNullOrWhiteSpace(thing.name)) {
    return false;
  }
  return true;
}