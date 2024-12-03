import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { MetabaseClientImp } from '../../../output/http/MetabaseClientImp';
import { GetEmbedUrlUseCase } from '../../../../domain/useCases/getEmbedUrl';
import { LambdaHttpResponse } from '../../helpers/httpResponse';
import { GetEmbedUrlUseCaseInput } from '../../../../domain/useCases/getEmbedUrl/input';
import { GetEmbedUrlUseCaseOutput } from '../../../../domain/useCases/getEmbedUrl/output';
import { httpErrorHandler } from '../../helpers/httpErrorHandler';
import { HttpAuth } from '../../helpers/httpAuth';

const metabaseClient = new MetabaseClientImp();
const useCase = new GetEmbedUrlUseCase(metabaseClient);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
	try {
		const loggedInUser = HttpAuth.parseLoggedInUser(event);

		const useCaseInput: GetEmbedUrlUseCaseInput = {
			loggedInUser
		};
		const result: GetEmbedUrlUseCaseOutput = await useCase.execute(useCaseInput);

		return LambdaHttpResponse.success(result);
	} catch (error) {
		return httpErrorHandler(error);
	}
};
