import * as aws from 'aws-sdk';
import * as awsxray from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utilities/logger';
import { Picture } from '../models/Picture';

const awsx = awsxray.captureAWS(aws);
const logger = createLogger('Picture Context');

export class PictureContext {
    constructor (
        private readonly docClient: DocumentClient = new awsx.DynamoDB.DocumentClient(),
        private readonly pictureTable: string = process.env.PICTURE_TABLE
    ){}

    // Create
    async createPicture(picture: Picture): Promise<Picture> {
        logger.info(`Creating new Picture: ${picture}`);
        await this.docClient.put({
            TableName: this.pictureTable,
            Item: picture,
          }).promise();
          
        return picture;
    }

    // Retrieve
    async getPicture(pictureId: string): Promise<Picture> {
        const result = await this.docClient.query({
            TableName: this.pictureTable,
            KeyConditionExpression: 'id = :pictureId',
            ExpressionAttributeValues: {
                ':pictureId': pictureId
            }
          }).promise();
          
          return result.Items[0] as Picture;
    }
    async getPicturesByThingId(thingId: string): Promise<Picture[]> {
        const result = await this.docClient.query({
            TableName: this.pictureTable,
            KeyConditionExpression: 'thingId = :thingId',
            ExpressionAttributeValues: {
                ':thingId': thingId
            }
          }).promise();

          return result.Items as Picture[];
    }

    // Update
    async updatePicture(picture: Picture): Promise<Picture> {
        logger.info(`Updating Picture: ${picture.id}`);

        await this.docClient.update({
            TableName: this.pictureTable,
            Key: { 
                id: picture.id 
            },
            UpdateExpression: "set url = :url, thingId = :thingId",
            ExpressionAttributeValues: {
                ":url": picture.url,
                ":thingId": picture.thingId
            },
            ReturnValues: "UPDATED_NEW"
        }).promise();

        return picture as Picture;
    }

    // Delete
    async deletePicture(pictureId: string): Promise<void> {
        logger.info(`Deleting Picture ${pictureId}`);
        const params = {
            TableName: this.pictureTable,
            Key: {
              id: pictureId 
            }
        }

        await this.docClient.delete(params).promise()
    }
    async deletePicturesByThingId(thingId: string): Promise<void> {
        logger.info(`Deleting all Pictures for Thing ${thingId}`);
        const params = {
            TableName: this.pictureTable,
            Key: {
              thingId: thingId
            }
        }

        await this.docClient.delete(params).promise()
    }
}