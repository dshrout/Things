import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { Picture } from '../../../models/Picture';
import { getUserFromJwt } from '../../../utilities/jwtHelper';
import { createPicture, updatePicture } from '../../../repository/pictureRepo';
import { createLogger } from '../../../utilities/logger';
import { IsNullOrWhiteSpace } from '../../../utilities/stringHelper';
import { getUploadUrl } from '../../../utilities/s3Helper';

const logger = createLogger('createPicture');
const bucketName = process.env.ATTACHMENT_S3_BUCKET;

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Create Picture: ', event);

  const newPicture: Picture = JSON.parse(event.body);
  const userId = getUserFromJwt(event);

  if (!ValidateRequest(userId, newPicture)) {
    return {
      statusCode: 400,
      body: 'One or more required fields are empty.'
    }
  }

  const picture = await createPicture(newPicture);
  const uploadUrl = getUploadUrl(picture.id);
  picture.url = `https://${bucketName}.s3.amazonaws.com/${picture.id}`;
  const fullPicture = await updatePicture(picture);

  if (!ValidatePicture(fullPicture)) {
    return {
      statusCode: 500,
      body: 'Unknown Error Occurred.'
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      item: uploadUrl
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)

function ValidateRequest(userId: string, picture: Picture): boolean {
  if(IsNullOrWhiteSpace(userId) || IsNullOrWhiteSpace(picture.thingId)) {
    return false;
  }
  return true;
}

function ValidatePicture(picture: Picture) {
  if (IsNullOrWhiteSpace(picture.id) || IsNullOrWhiteSpace(picture.thingId) || IsNullOrWhiteSpace(picture.url)) {
    return false;
  }
  return true;
}