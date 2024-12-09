import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MetabaseClientImp } from '../../../output/http/MetabaseClientImp';
import { GetEmbedUrlUseCase } from '../../../../domain/useCases/getEmbedUrl';
import { LambdaHttpResponse } from '../../helpers/http/httpResponse';
import { GetEmbedUrlUseCaseInput } from '../../../../domain/useCases/getEmbedUrl/input';
import { GetEmbedUrlUseCaseOutput } from '../../../../domain/useCases/getEmbedUrl/output';
import { httpErrorHandler } from '../../helpers/http/httpErrorHandler';
import { requestBody } from './input';
import { HttpAuth } from '../../helpers/http/httpAuth';
import { HttpBodyParser } from '../../helpers/http/httpBodyParser';
import { validateBody } from './validator';

const metabaseClient = new MetabaseClientImp();
const useCase = new GetEmbedUrlUseCase(metabaseClient);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	try {
		const loggedInUser = HttpAuth.parseLoggedInUser(event);

		const body = HttpBodyParser.parseJson<requestBody>(event);

		validateBody(body);

		const useCaseInput: GetEmbedUrlUseCaseInput = {
			dashboard: body.dashboard,
			loggedInUser
		};
		const result: GetEmbedUrlUseCaseOutput = await useCase.execute(useCaseInput);

		return LambdaHttpResponse.success(result);
	} catch (error) {
		return httpErrorHandler(error);
	}
};
