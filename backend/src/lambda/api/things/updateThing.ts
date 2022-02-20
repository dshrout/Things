import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { getThingById, updateThing } from '../../../repository/thingRepo';
import { Thing } from '../../../models/Thing';
import { getUserFromJwt } from '../../../utilities/jwtHelper';
import { createLogger } from '../../../utilities/logger';
import { IsNullOrWhiteSpace } from '../../../utilities/stringHelper';

const logger = createLogger('Update Thing');

let newThing: Thing;
let updatedThing: Thing;

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Update Thing: ', event);

  if (!ValidateNewThing(event)) {
    return MissingRequiredFieldsError();
  }

  if (!await ValidateThingExists()) {
    return ThingNotFoundError();
  }

  updatedThing = await updateThing(newThing);

  return UpdateSuccess();
})

function ValidateNewThing(event: APIGatewayProxyEvent): boolean {
  newThing = JSON.parse(event.body)
  newThing.userId = getUserFromJwt(event)
  if(IsNullOrWhiteSpace(newThing.userId)) {
    return false;
  }
  return true;
}

function MissingRequiredFieldsError() {
  logger.info('HTTP 400 - Missing required field. ' + newThing);
  return {
      statusCode: 400,
      body: 'Missing required field.'
    }
}

async function ValidateThingExists(): Promise<boolean> {
  const existingThing = await getThingById(newThing.userId, newThing.id);
  if (IsNullOrWhiteSpace(existingThing?.name)) {
    return false;
  }
  return true;
}

function ThingNotFoundError() {
  logger.info('HTTP 404 - Thing with id ' + newThing.id + ' not found for user ' + newThing.userId);
  return {
    statusCode: 404,
    body: 'Thing not found.'
  }
}

function UpdateSuccess() {
  return {
    statusCode: 200,
    body: JSON.stringify({
      items: updatedThing
    })
  }
}

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  