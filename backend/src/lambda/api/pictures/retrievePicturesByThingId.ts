import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { getPicturesByThingId } from '../../../repository/pictureRepo';
import { getUserFromJwt } from '../../../utilities/jwtHelper';
import { createLogger } from '../../../utilities/logger';
import { IsNullOrWhiteSpace } from '../../../utilities/stringHelper';

const logger = createLogger('Retrieve Pictures By Thing Id');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Get Pictures By Thing Id: ', event);

  const userId = getUserFromJwt(event);
  if (IsNullOrWhiteSpace(userId)) {
    return {
      statusCode: 400,
      body: 'Invalid User ID.'
    }
  }

  const thingId = event.queryStringParameters.thingId;
  if (IsNullOrWhiteSpace(thingId)) {
    return {
      statusCode: 400,
      body: 'One or more required fields are empty.'
    }
  }

  const pictures = await getPicturesByThingId(thingId);

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: pictures
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
