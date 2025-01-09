import { LambdaBasic } from '$lib/infrastructure/constructors/lambda';
import { Construct } from 'constructs';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';

type HeaderAuthorizerProps = {
	authorizationHeaderValue: string;
};

/**
 * This class creates a custom authorizer for API Gateway that checks the value of requests' header.
 * The expected header value is a required parameter to instantiate the class.
 * It is passed as an environment variable to a lambda function,
 * which is responsible for handling incoming requests header validation.
 * Finally, a TokenAuthorizer is created with the lambda function as the handler.
 * The authorizer is then used to build the API Gateway (only for endpoints that require this
 * kind of validation).
 *
 * Infrastructure resources created by this class:
 * - Lambda function to handle the request authorization
 * - TokenAuthorizer for API Gateway
 */
export class HeaderAuthorizer extends Construct {
	public readonly authorizer: apiGateway.TokenAuthorizer;

	private authorizerFunction: lambdaNodejs.NodejsFunction;

	constructor(scope: Construct, id: string, props: HeaderAuthorizerProps) {
		super(scope, id);

		// creation of supporting lambda function to handle request authorization
		this.authorizerFunction = this.createAuthorizerFunction(props);

		// create authorizer
		this.authorizer = new apiGateway.TokenAuthorizer(this, 'Authorizer', {
			handler: this.authorizerFunction
		});
	}

	private createAuthorizerFunction(props: HeaderAuthorizerProps): lambdaNodejs.NodejsFunction {
		const authorizerFunction = new LambdaBasic(this, 'AuthorizerFunction', {
			entry: 'src/api-gateway-module/infrastructure/helpers/authorizerFunction.ts',
			handler: 'handler',
			environment: {
				AUTHORIZATION_KEY: props.authorizationHeaderValue
			}
		});

		return authorizerFunction.lambda;
	}
}
