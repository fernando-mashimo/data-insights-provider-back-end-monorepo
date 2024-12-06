import { APIGatewayProxyResult } from 'aws-lambda';
// import { LambdaHttpResponse } from "../../helpers/httpResponse";

export const handler = async (): Promise<APIGatewayProxyResult> => {
	// return LambdaHttpResponse.success();
	throw new Error('Async DLQ test error');
};
