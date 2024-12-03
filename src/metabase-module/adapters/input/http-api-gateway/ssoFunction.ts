import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { LambdaHttpResponse } from '../helpers/httpResponse';
import { IllegalArgumentError } from '../../../domain/errors/illegalArgumentError';
import { SsoUseCase } from '../../../domain/useCases/ssoUseCase';
import { UserAttributes } from '../types/userAttributes';
import { jwtDecode } from 'jwt-decode';
import { GetDashboardRequest } from './request';
import { DataDisplayManager } from '../../output/http/dataDisplayManager';

export const handler = async (
	event: APIGatewayProxyEvent,
	context: Context
): Promise<APIGatewayProxyResult> => {
	try {
		const lambdaRequestId = context.awsRequestId;
		const apiRequestId = event.requestContext.requestId;
		console.info(`API Gateway RequestId: ${apiRequestId}\nLambda RequestId: ${lambdaRequestId}`);

		const idToken: string = event.headers['Authorization']
			? event.headers['Authorization'].split('Bearer ')[1]
			: '';
		const userAttributes: UserAttributes = jwtDecode(idToken);

		const request = new GetDashboardRequest(userAttributes);
		request.validate();

		const dataDisplayManager = new DataDisplayManager();
		const useCase = new SsoUseCase(dataDisplayManager);
		const result = await useCase.execute(userAttributes);

		return LambdaHttpResponse.success(result);
	} catch (error) {
		if (error instanceof IllegalArgumentError)
			return LambdaHttpResponse.error(400, 'INVALID_PARAMETERS', error.message);

		console.error('Cannot handle SSO event', error);
		return LambdaHttpResponse.error(500, 'INTERNAL_ERROR');
	}
};
