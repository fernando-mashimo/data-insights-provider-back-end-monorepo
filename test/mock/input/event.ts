import { APIGatewayProxyEvent, Context, SQSRecord } from 'aws-lambda';

export const ApiGatewayBaseEvent: APIGatewayProxyEvent = {
	body: '',
	headers: {},
	multiValueHeaders: {},
	httpMethod: '',
	isBase64Encoded: false,
	path: '',
	pathParameters: null,
	queryStringParameters: null,
	multiValueQueryStringParameters: null,
	stageVariables: null,
	requestContext: {
		accountId: '',
		apiId: '',
		authorizer: {},
		httpMethod: '',
		identity: {
			accessKey: null,
			accountId: null,
			apiKey: null,
			apiKeyId: null,
			caller: null,
			clientCert: null,
			cognitoAuthenticationProvider: null,
			cognitoAuthenticationType: null,
			cognitoIdentityId: null,
			cognitoIdentityPoolId: null,
			principalOrgId: null,
			sourceIp: '',
			user: null,
			userAgent: null,
			userArn: null
		},
		path: '',
		protocol: '',
		requestId: '',
		requestTimeEpoch: 0,
		resourceId: '',
		resourcePath: '',
		stage: ''
	},
	resource: ''
};

export const SQSRecordBaseEvent: SQSRecord = {
	messageId: '',
	receiptHandle: '',
	body: '',
	attributes: {
    ApproximateReceiveCount: '',
    SentTimestamp: '',
    SenderId: '',
    ApproximateFirstReceiveTimestamp: ''
  },
	messageAttributes: {},
	md5OfBody: '',
	eventSource: '',
	eventSourceARN: '',
	awsRegion: ''
};

export const ApiGatewayBaseContext: Context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: '',
  functionVersion: '',
  invokedFunctionArn: '',
  memoryLimitInMB: '',
  awsRequestId: '',
  logGroupName: '',
  logStreamName: '',
  getRemainingTimeInMillis: function (): number {
    throw new Error('Function not implemented.');
  },
  done: function (): void {
    throw new Error('Function not implemented.');
  },
  fail: function (): void {
    throw new Error('Function not implemented.');
  },
  succeed: function (): void {
    throw new Error('Function not implemented.');
  }
};
