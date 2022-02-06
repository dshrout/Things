import * as aws from 'aws-sdk'
import * as awsxray from 'aws-xray-sdk'

const awsx = awsxray.captureAWS(aws);
const s3 = new awsx.S3({signatureVersion: 'v4'});
const bucketName = process.env.ATTACHMENT_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

export function getAttachmentUrl (todoId: string): string {
    return s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: todoId,
      Expires: parseInt(urlExpiration)
    });
  }
  
  