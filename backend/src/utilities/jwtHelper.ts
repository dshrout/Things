import { APIGatewayProxyEvent } from "aws-lambda";
import { decode } from 'jsonwebtoken'
import { JwtPayload } from '../models/JwtPayload'

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 * @returns a user id from a JWT token
 */
export function getUserFromJwt(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization;
  const jwtToken = authorization.split(' ')[1];
  return parseUserId(jwtToken)
}

function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}
