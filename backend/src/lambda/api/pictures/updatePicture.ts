import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { PictureRepo } from '../../../repository/pictureRepo';
import { Picture } from '../../../models/Picture';
import { getUserFromJwt } from '../../../utilities/jwtHelper';
import { createLogger } from '../../../utilities/logger';
import { IsNullOrWhiteSpace } from '../../../utilities/stringHelper';
import { getUploadUrl } from '../../../utilities/s3Helper';

const logger = createLogger('Update Picture');
const bucketName = process.env.IMAGES_S3_BUCKET;
const pictureRepo = new PictureRepo();

let userId: string;
let uploadUrl: string;
let newPicture: Picture;
let updatedPicture: Picture;
let existingPicture: Picture;

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Update Picture: ', event);

  userId = getUserFromJwt(event)
  newPicture = JSON.parse(event.body);

  if (!ValidateUser()) {
    return InvalidUserError();
  }

  existingPicture = await pictureRepo.getPicture(userId, newPicture.id);
  if (!ValidatePictureExists()) {
    return PictureNotFoundError();
  }

  if (newPicture.thingId == existingPicture.thingId) {
    uploadUrl = getUploadUrl(existingPicture.id);
    newPicture.url = `https://${bucketName}.s3.amazonaws.com/${existingPicture.id}`;
  }

  updatedPicture = await pictureRepo.updatePicture(newPicture);

  return UpdateSuccess();
})

function ValidateUser(): boolean {
  if(IsNullOrWhiteSpace(userId)) {
    return false;
  }
  return true;
}
function InvalidUserError() {
  logger.info('HTTP 401 - Invalid userId');
  return {
      statusCode: 401,
      body: 'Invalid userId.'
    }
}

function ValidatePictureExists(): boolean {
  if(IsNullOrWhiteSpace(existingPicture?.id)) {
    return false;
  }
  return true;
}
function PictureNotFoundError() {
  logger.info('HTTP 404 - Picture with id ' + newPicture.id + ' not found for user ' + userId);
  return {
    statusCode: 404,
    body: 'Picture not found.'
  }
}

function UpdateSuccess() {
  const returnItem = uploadUrl || updatedPicture;
  return {
    statusCode: 200,
    body: JSON.stringify({
      items: returnItem
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
  