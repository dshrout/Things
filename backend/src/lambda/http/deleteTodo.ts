import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { getTodoById, deleteTodo } from '../../repository/thingRepo';
import { getUserId } from '../../utils/jwtHelper';
import { createLogger } from '../../utils/logger';
import { IsNullOrWhiteSpace } from '../../utils/stringHelper';

const logger = createLogger('deleteTodo');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Delete Todo: ', event);

  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  if (IsNullOrWhiteSpace(userId) || IsNullOrWhiteSpace(todoId)) {
    return {
      statusCode: 400,
      body: 'One or more items are empty.'
    }
  }

  const item = await getTodoById(userId, todoId);
  if (item.length === 0) {
    logger.info('HTTP 404 - todoId ' + todoId + ' not found for user ' + userId);
    return {
      statusCode: 404,
      body: 'Item not found.'
    }
  } else if (item.length > 1) {
    logger.info('HTTP 500 - todoId ' + todoId + ' returned multiple todos for user ' + userId);
    return {
      statusCode: 500,
      body: 'Internal server error.'
    }
  }

  await deleteTodo(userId, todoId);
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
