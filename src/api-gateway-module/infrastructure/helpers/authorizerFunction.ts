export const handler = async (event: AuthEvent): Promise<AuthResponse> => {
	const isRequestAuthorized = event.authorizationToken === process.env.AUTHORIZATION_KEY;

	if (!isRequestAuthorized) {
    console.info('Request unauthorized');
    return response('Unauthorized', event.methodArn);
  }

	return response('Authorized', event.methodArn);
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
