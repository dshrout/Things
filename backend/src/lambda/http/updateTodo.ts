import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
import { getTodoById, updateTodo } from '../../repository/thingRepo';
import { TodoUpdate } from '../../models/TodoUpdate';
import { getUserId } from '../../utils/jwtHelper';
import { createLogger } from '../../utils/logger';
import { IsNullOrWhiteSpace } from '../../utils/stringHelper';

const logger = createLogger('updateTodo');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Update Todo: ', event);

  const userId = getUserId(event)
  const todoId = event.pathParameters.todoId
  const todoUpdate: TodoUpdate = JSON.parse(event.body)
  if (IsNullOrWhiteSpace(userId) || IsNullOrWhiteSpace(todoId) || IsNullOrWhiteSpace(todoUpdate.name) || IsNullOrWhiteSpace(todoUpdate.dueDate)) {
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

  const items = await updateTodo(userId, todoId, todoUpdate);
  return {
    statusCode: 200,
    body: JSON.stringify({
      items
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
