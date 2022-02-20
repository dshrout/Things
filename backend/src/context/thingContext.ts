import * as aws from 'aws-sdk';
import * as awsxray from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utilities/logger';
import { Thing } from '../models/Thing';

const awsx = awsxray.captureAWS(aws);
const logger = createLogger('Thing Context');

export class ThingContext {
    constructor (
        private readonly docClient: DocumentClient = new awsx.DynamoDB.DocumentClient(),
        private readonly thingTable: string = process.env.THINGS_TABLE
    ){}

    // Create
    async createThing(thing: Thing): Promise<Thing> {
        logger.info(`Creating new Thing: ${thing}`);
        await this.docClient.put({
            TableName: this.thingTable,
            Item: thing,
          }).promise();
          
        return thing;
    }

    // Retrieve
    async getThings(userId: string): Promise<Thing[]> {
        const result = await this.docClient.query({
            TableName: this.thingTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
          }).promise();
          
          return result.Items as Thing[];
    }
    async getThingById(userId: string, thingId: string): Promise<Thing> {
        const result = await this.docClient.query({
            TableName: this.thingTable,
            KeyConditionExpression: 'userId = :userId AND id = :thingId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':thingId': thingId
            }
          }).promise();

          return result.Items[0] as Thing;
    }

    // Update
    async updateThing(thing: Thing): Promise<Thing> {
        logger.info(`Updating Thing: ${thing.id}`);

        await this.docClient.update({
            TableName: this.thingTable,
            Key: { 
                userId: thing.userId,
                id: thing.id 
            },
            ExpressionAttributeNames: {"#n": "name"}, // avoid conflict with DynamoDB reserved word. (https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html)
            UpdateExpression: "set category = :category, #n = :name, rating = :rating, review = :review",
            ExpressionAttributeValues: {
                ":category": thing.category,
                ":name": thing.name,
                ":rating": thing.rating,
                ":review": thing.review,
            },
            ReturnValues: "UPDATED_NEW"
        }).promise();

        return thing as Thing;
    }

    // Delete
    async deleteThing(userId: string, thingId: string): Promise<void> {
        logger.info(`Deleting Thing ${thingId}`);
        const params = {
            TableName: this.thingTable,
            Key: {
              userId: userId,
              id: thingId 
            }
        }

        await this.docClient.delete(params).promise()
    }

    // // setAttachmentUrl
    // async setAttachmentUrl(updatedTodo: any): Promise<TodoItem> {
    //     logger.info(`updatedTodo.attachmentUrl: ${updatedTodo.attachmentUrl}`);
    //     await this.docClient.update({
    //         TableName: this.todoTable,
    //         Key: { 
    //             todoId: updatedTodo.todoId, 
    //             userId: updatedTodo.userId },
    //         UpdateExpression: "set attachmentUrl = :attachmentUrl",
    //         ExpressionAttributeValues: {
    //             ":attachmentUrl": updatedTodo.attachmentUrl,
    //         },
    //         ReturnValues: "UPDATED_NEW"
    //     }).promise();
    //      
    //     return updatedTodo;
    // }
}