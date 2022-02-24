import * as aws from 'aws-sdk'
import * as awsxray from 'aws-xray-sdk'

const awsx = awsxray.captureAWS(aws);
const s3 = new awsx.S3({signatureVersion: 'v4'});
const bucketName = process.env.IMAGES_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export function getUploadUrl (pictureId: string): string {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: pictureId,
    Expires: parseInt(urlExpiration)
  });
}

export function deletePictureFile (pictureId: string) {
  return s3.deleteObject({
    Bucket: bucketName,
    Key: pictureId
  });
}
