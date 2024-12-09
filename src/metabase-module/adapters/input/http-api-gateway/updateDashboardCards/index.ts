import { APIGatewayProxyResult } from 'aws-lambda';
import { UpdateDashboardCardsUseCase } from '../../../../domain/useCases/updateDashboardCards';
import { MetabaseClientImp } from '../../../output/http/MetabaseClientImp';
import { httpErrorHandler } from '../../helpers/http/httpErrorHandler';
import { LambdaHttpResponse } from '../../helpers/http/httpResponse';

const metabaseClient = new MetabaseClientImp();
const useCase = new UpdateDashboardCardsUseCase(metabaseClient);

export const handler = async (): Promise<APIGatewayProxyResult> => {
	try {
		await useCase.execute();

		return LambdaHttpResponse.success();
	} catch (error) {
		return httpErrorHandler(error);
	}
};
