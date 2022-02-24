import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { PictureRepo } from '../../../repository/pictureRepo';
import { getUserFromJwt } from '../../../utilities/jwtHelper';
import { createLogger } from '../../../utilities/logger';
import { IsNullOrWhiteSpace } from '../../../utilities/stringHelper';

const logger = createLogger('Retrieve Picture');
const pictureRepo = new PictureRepo();

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Get Picture: ', event);

  const userId = getUserFromJwt(event);
  if (IsNullOrWhiteSpace(userId)) {
    return {
      statusCode: 400,
      body: 'Invalid User ID.'
    }
  }

  const pictureId = event.pathParameters.id
  const picture = await pictureRepo.getPicture(userId, pictureId);

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: picture
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
