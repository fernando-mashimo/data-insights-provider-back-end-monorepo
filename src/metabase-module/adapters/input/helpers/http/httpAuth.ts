import { APIGatewayProxyEvent } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import { UnauthorizedError } from './httpErrors';
import { LoggedInUser } from '../../../../domain/entities/LoggedInUser';

export type IdTokenAttributes = {
	at_hash?: string;
	sub: string;
	email_verified?: boolean;
	iss?: string;
	'cognito:username'?: string;
	origin_jti?: string;
	aud?: string;
	token_use?: string;
	auth_time?: number;
	exp?: number;
	iat?: number;
	jti?: string;
	email: string;
	'custom:dashboard_id'?: number;
};

export class HttpAuth {
	public static parseLoggedInUser(event: APIGatewayProxyEvent): LoggedInUser {
		const headers = event.headers;
		const authorization = headers.Authorization || headers.authorization;
		if (!authorization) throw new UnauthorizedError('No authorization header provided');

		const token = authorization.split('Bearer ')[1];
		if (!token) throw new UnauthorizedError('No token provided');

		const idToken = jwt.decode(token) as IdTokenAttributes;

		// token validation is expected to be done on gateway level

		return new LoggedInUser(idToken.sub, idToken.email);
	}
}
