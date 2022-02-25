import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { Picture } from '../../../models/Picture';
import { getUserFromJwt } from '../../../utilities/jwtHelper';
import { PictureRepo } from '../../../repository/pictureRepo';
import { createLogger } from '../../../utilities/logger';
import { IsNullOrWhiteSpace } from '../../../utilities/stringHelper';
import { getS3UploadUrl } from '../../../utilities/s3Helper';

const logger = createLogger('createPicture');
const bucketName = process.env.IMAGES_S3_BUCKET;
const pictureRepo = new PictureRepo();

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Create Picture: ', event);

  let newPicture: Picture = JSON.parse(event.body);
  newPicture.userId = getUserFromJwt(event);

  if (!ValidateRequest(newPicture)) {
    return {
      statusCode: 400,
      body: 'One or more required fields are empty.'
    }
  }

  const picture = await pictureRepo.createPicture(newPicture);
  let uploadUrl = getS3UploadUrl(picture.id);
  picture.url = `https://${bucketName}.s3.amazonaws.com/${picture.id}`;
  const fullPicture = await pictureRepo.updatePicture(picture);

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

function ValidateRequest(picture: Picture): boolean {
  if(IsNullOrWhiteSpace(picture.userId) || IsNullOrWhiteSpace(picture.thingId)) {
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