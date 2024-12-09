import { APIGatewayProxyResult } from 'aws-lambda';
import { IllegalArgumentError } from '../../../../domain/errors/illegalArgumentError';
import { LambdaHttpResponse } from './httpResponse';
import { UnauthorizedError } from '../../../../domain/errors/unauthorizedError';
import { HttpError } from './httpErrors';

export function httpErrorHandler(error: unknown): APIGatewayProxyResult {
	if (error instanceof IllegalArgumentError)
		return LambdaHttpResponse.error(400, 'INVALID_PARAMETERS', error.message);

	if (error instanceof UnauthorizedError)
		return LambdaHttpResponse.error(401, 'UNAUTHORIZED', error.message);

	if (error instanceof HttpError)
		return LambdaHttpResponse.error(error.statusCode, error.code, error.message);

	console.error('Internal error', error);
	return LambdaHttpResponse.error(500, 'INTERNAL_ERROR');
}
