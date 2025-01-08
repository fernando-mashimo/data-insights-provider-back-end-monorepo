import { $config } from '$config';

export const handler = async (event: AuthEvent): Promise<AuthResponse> => {
	const endpoint: string = event.methodArn.split('/prod/')[1];

	const isRequestAuthorized = verifyRequestAuthorization(event, endpoint); // verify if the request is authorized - this function must be updated when new endpoints/webhooks are added

	if (!isRequestAuthorized) {
    console.info('Request unauthorized');
    return response('Unauthorized', event.methodArn);
  }

	return response('Authorized', event.methodArn);
};

const verifyRequestAuthorization = (event: AuthEvent, endpoint: string): boolean => {
	if (endpoint === 'POST/data-extraction/linkedin-extraction/notify')
		return event.authorizationToken === $config.LINKEDIN_EXTRACTION_WEBHOOK_AUTHORIZATION;

	return false;
};

const response = (requestStatus: 'Authorized' | 'Unauthorized', eventMethodArn: string): AuthResponse => ({
	principalId: 'user',
	policyDocument: {
		Version: '2012-10-17',
		Statement: [
			{
				Action: 'execute-api:Invoke',
				Effect: requestStatus === 'Authorized' ? 'Allow' : 'Deny',
				Resource: eventMethodArn
			}
		]
	}
});

interface PolicyDocument {
	Version: string;
	Statement: Array<{
		Action: string;
		Effect: string;
		Resource: string;
	}>;
}

interface AuthResponse {
	principalId: string;
	policyDocument: PolicyDocument;
}

interface AuthEvent {
	authorizationToken: string;
	methodArn: string;
}
