import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
//import { setAttachmentUrl } from '../../repository/thingRepo';
import { getUserFromJwt } from '../../utils/jwtHelper';
import { getUploadUrl } from '../../utils/s3Helper';
import { IsNullOrWhiteSpace } from '../../utils/stringHelper';

//const bucketName = process.env.ATTACHMENT_S3_BUCKET;

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserFromJwt(event);
  const thingId = event.pathParameters.thingId;
  if (IsNullOrWhiteSpace(userId) || IsNullOrWhiteSpace(thingId)) {
    return {
      statusCode: 400,
      body: 'One or more items are empty.'
    }
  }
  
  const uploadUrl = getUploadUrl(thingId);
  //const attachmentUrl: string = `https://${bucketName}.s3.amazonaws.com/${thingId}`

  //await setAttachmentUrl(userId, thingId, attachmentUrl);

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl
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
