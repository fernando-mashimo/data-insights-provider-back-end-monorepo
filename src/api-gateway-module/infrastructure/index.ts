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
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as IAM from 'aws-cdk-lib/aws-iam';

interface ApiGatewayStackProps extends cdk.StackProps {
	getEmbedUrlHandler: lambdaNodejs.NodejsFunction;
	downloadExtractedLinkedinProfileQueue: sqs.Queue;
	userPool: cognito.IUserPool;
}

export class ApiGatewayStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
		super(scope, id, props);

		const api = this.createApiGateway();

		this.addApiGatewayCustomDomain(api);

		const authorizer = this.createAuthorizer(props.userPool);

		this.addApiResources(api, authorizer, props);

		this.addApiSqsResources(api, props);
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
		const metabaseResource = api.root.addResource('metabase', {
			defaultCorsPreflightOptions: {
				allowOrigins: $config.APPLICATION_ORIGINS,
				allowMethods: apiGateway.Cors.ALL_METHODS,
				allowHeaders: apiGateway.Cors.DEFAULT_HEADERS
			}
		});
		const dashboardResource = metabaseResource.addResource('dashboard');
		const getEmbedUrlIntegration = new apiGateway.LambdaIntegration(props.getEmbedUrlHandler);
		dashboardResource.addMethod('POST', getEmbedUrlIntegration, {
			authorizer: authorizer,
			authorizationType: apiGateway.AuthorizationType.COGNITO
		});
	}

	private addApiSqsResources(api: apiGateway.RestApi, props: ApiGatewayStackProps) {
		const dataExtractionResource = api.root.addResource('data-extraction', {
			defaultCorsPreflightOptions: {
				allowOrigins: $config.APPLICATION_ORIGINS,
				allowMethods: apiGateway.Cors.ALL_METHODS,
				allowHeaders: apiGateway.Cors.DEFAULT_HEADERS
			}
		});

		// role
		const integrationRole = new IAM.Role(this, 'integration-role', {
			assumedBy: new IAM.ServicePrincipal('apigateway.amazonaws.com')
		});

		// grant sqs:SendMessage* to Api Gateway Role
		props.downloadExtractedLinkedinProfileQueue.grantSendMessages(integrationRole);

		const linkedinExtractionResource = dataExtractionResource.addResource('linkedin-extraction');
		const notifyResource = linkedinExtractionResource.addResource('notify');
		const downloadExtractedLinkedinProfileIntegration = new apiGateway.AwsIntegration({
			service: 'sqs',
			integrationHttpMethod: 'POST',
			path: `${props.downloadExtractedLinkedinProfileQueue.queueName}`,
			options: {
				passthroughBehavior: apiGateway.PassthroughBehavior.NEVER,
				credentialsRole: integrationRole,
				requestParameters: {
					'integration.request.header.Content-Type': "'application/x-www-form-urlencoded'"
				},
				requestTemplates: {
					'application/json': `Action=SendMessage&MessageBody=$util.urlEncode($input.body)`
				},
				integrationResponses: [
					{
						statusCode: '200',
						responseTemplates: {
							'application/json': '{}'
						}
					}
				]
			}
		});
		notifyResource.addMethod('POST', downloadExtractedLinkedinProfileIntegration, {
			methodResponses: [
				{
					statusCode: '200'
				}
			]
		});
	}
}
