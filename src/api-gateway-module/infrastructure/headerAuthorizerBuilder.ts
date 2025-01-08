import { LambdaBasic } from '$lib/infrastructure/constructors/lambda';
import { Construct } from 'constructs';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';

type HeaderAuthorizerBuilderProps = {
	authorizationHeaderValue: string;
};

export class HeaderAuthorizerBuilder extends Construct {
	public readonly authorizer: apiGateway.TokenAuthorizer;

	private authorizerFunction: lambdaNodejs.NodejsFunction;

	constructor(scope: Construct, id: string, props: HeaderAuthorizerBuilderProps) {
		super(scope, id);

		// creation of supporting lambda function to handle request authorization
		this.authorizerFunction = this.createAuthorizerFunction(props);

		// create authorizer
		this.authorizer = new apiGateway.TokenAuthorizer(this, 'Authorizer', {
			handler: this.authorizerFunction
		});
	}

	private createAuthorizerFunction(props: HeaderAuthorizerBuilderProps): lambdaNodejs.NodejsFunction {
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
