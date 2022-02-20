import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { getPicture, deletePicture } from '../../../repository/pictureRepo';
import { getUserFromJwt } from '../../../utilities/jwtHelper';
import { createLogger } from '../../../utilities/logger';
import { IsNullOrWhiteSpace } from '../../../utilities/stringHelper';

const logger = createLogger('Delete Picture');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Delete Picture: ', event);

  const userId = getUserFromJwt(event)
  const pictureId = event.pathParameters.id
  if (IsNullOrWhiteSpace(userId) || IsNullOrWhiteSpace(pictureId)) {
    return {
      statusCode: 400,
      body: 'One or more items are empty.'
    }
  }

  const picture = await getPicture(pictureId);
  if (IsNullOrWhiteSpace(picture.id)) {
    logger.info('HTTP 404 - pictureId ' + pictureId + ' not found for user ' + userId);
    return {
      statusCode: 404,
      body: 'Item not found.'
    }
  }

  await deletePicture(pictureId);
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
