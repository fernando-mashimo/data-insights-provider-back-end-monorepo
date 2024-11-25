import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as cwLogs from 'aws-cdk-lib/aws-logs';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { $config } from '$config';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as targets from 'aws-cdk-lib/aws-route53-targets';

interface ApiGatewayStackProps extends cdk.StackProps {
	ssoHandler: lambdaNodejs.NodejsFunction;
	userPool: cognito.IUserPool;
}

export class ApiGatewayStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
		super(scope, id, props);

		const api = this.createApiGateway();

		this.addApiGatewayCustomDomain(api);

		const authorizer = this.createAuthorizer(props.userPool);

		this.addApiResources(api, authorizer, props);
	}

	private createApiGateway(): apiGateway.RestApi {
		const logGroup = new cwLogs.LogGroup(this, 'ApiGatewayLogs');
		const api = new apiGateway.RestApi(this, 'DeltaApiGateway', {
			restApiName: 'DeltaApiGateway',
			description: 'API Gateway for Delta AI',
			cloudWatchRole: true,
			deployOptions: {
				accessLogDestination: new apiGateway.LogGroupLogDestination(logGroup),
				accessLogFormat: apiGateway.AccessLogFormat.jsonWithStandardFields({
					httpMethod: true,
					ip: true,
					protocol: true,
					requestTime: true,
					resourcePath: true,
					responseLength: true,
					status: true,
					caller: true,
					user: true
				})
			}
		});

		return api;
	}

	private addApiGatewayCustomDomain(api: apiGateway.RestApi): void {
		const hostedZone = route53.HostedZone.fromLookup(this, 'ApiGatewayHostedZone', {
			domainName: $config.DOMAIN_NAME
		});

		const certificate = new acm.Certificate(this, 'ApiGatewayDomainCertificate', {
			domainName: $config.API_GATEWAY_DOMAIN_NAME,
			validation: acm.CertificateValidation.fromDns(hostedZone)
		});

		new cdk.CfnOutput(this, 'ApiGatewayCertificateArn', {
			value: certificate.certificateArn
		});

		const apiGatewayDomain = api.addDomainName('ApiGatewayDomain', {
			domainName: $config.API_GATEWAY_DOMAIN_NAME,
			certificate: certificate
		});

		new route53.ARecord(this, 'ApiGatewayAliasRecord', {
			zone: hostedZone,
			recordName: $config.API_GATEWAY_DOMAIN_NAME,
			target: route53.RecordTarget.fromAlias(new targets.ApiGatewayDomain(apiGatewayDomain))
		});
	}

	private createAuthorizer(userPool: cognito.IUserPool): apiGateway.CognitoUserPoolsAuthorizer {
		return new apiGateway.CognitoUserPoolsAuthorizer(this, 'ApiGatewayAuthorizer', {
			cognitoUserPools: [userPool]
		});
	}

	private addApiResources(
		api: apiGateway.RestApi,
		authorizer: apiGateway.CognitoUserPoolsAuthorizer,
		props: ApiGatewayStackProps
	): void {
		// Adds resources for metabase/dashboard endpoint
		const metabaseResource = api.root.addResource('metabase');
    const dashboardResource = metabaseResource.addResource('dashboard');
		const ssoIntegration = new apiGateway.LambdaIntegration(props.ssoHandler);
		dashboardResource.addMethod('POST', ssoIntegration, {
			authorizer: authorizer,
			authorizationType: apiGateway.AuthorizationType.COGNITO
		});
	}
}
