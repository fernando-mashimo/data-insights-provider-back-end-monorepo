import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as cwLogs from 'aws-cdk-lib/aws-logs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { $config } from '$config';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { RestApiBuilder, DefaultConfigurations as apiConf } from './restApiBuilder';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { HeaderAuthorizer } from './headerAuthorizerBuilder';

interface ApiGatewayStackProps extends cdk.StackProps {
	getEmbedUrlHandler: lambdaNodejs.NodejsFunction;
	downloadExtractedLinkedinProfileQueue: sqs.Queue;
	handleEscavadorCallbackResponseQueue: sqs.Queue;
	userPool: cognito.IUserPool;
}

export class ApiGatewayStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
		super(scope, id, props);

		const logGroup = new cwLogs.LogGroup(this, 'ApiGatewayLogs');
		const api = RestApiBuilder.create(this, 'ApiGateway', {
			userPool: props.userPool,
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
		})
			.post('/metabase/dashboard', props.getEmbedUrlHandler, [
				apiConf.AUTHENTICATED,
				apiConf.ENABLED_CORS
			])
			.post(
				'/data-extraction/linkedin-extraction/notify',
				props.downloadExtractedLinkedinProfileQueue,
				{
					methodOptions: {
						authorizer: new HeaderAuthorizer(this, 'LinkedinDataExtractionAuthorizer', {
							authorizationHeaderValue: $config.LINKEDIN_EXTRACTION_WEBHOOK_AUTHORIZATION
						}).authorizer,
						authorizationType: apiGateway.AuthorizationType.CUSTOM
					}
				}
			)
			.post(
				'/data-extraction/escavador-callback/receive',
				props.handleEscavadorCallbackResponseQueue,
				{
					methodOptions: {
						authorizer: new HeaderAuthorizer(this, 'EscavadorCallbackResponseAuthorizer', {
							authorizationHeaderValue: $config.ESCAVADOR_CALLBACK_AUTHORIZATION
						}).authorizer,
						authorizationType: apiGateway.AuthorizationType.CUSTOM
					}
				}
			)
			.build();

		this.addApiGatewayCustomDomain(api);
		this.setupApiGatewayDefaultResponse(api);
	}

	/**
	 * Setup the default response for the API Gateway for when the integration fails.
	 * Like unauthorized, access denied, etc.
	 */
	private setupApiGatewayDefaultResponse(api: apiGateway.RestApi): void {
		const responseTypes = [
			apiGateway.ResponseType.ACCESS_DENIED,
			apiGateway.ResponseType.API_CONFIGURATION_ERROR,
			apiGateway.ResponseType.AUTHORIZER_FAILURE,
			apiGateway.ResponseType.AUTHORIZER_CONFIGURATION_ERROR,
			apiGateway.ResponseType.BAD_REQUEST_PARAMETERS,
			apiGateway.ResponseType.BAD_REQUEST_BODY,
			apiGateway.ResponseType.DEFAULT_4XX,
			apiGateway.ResponseType.DEFAULT_5XX,
			apiGateway.ResponseType.EXPIRED_TOKEN,
			apiGateway.ResponseType.INVALID_SIGNATURE,
			apiGateway.ResponseType.INTEGRATION_FAILURE,
			apiGateway.ResponseType.INTEGRATION_TIMEOUT,
			apiGateway.ResponseType.INVALID_API_KEY,
			apiGateway.ResponseType.MISSING_AUTHENTICATION_TOKEN,
			apiGateway.ResponseType.QUOTA_EXCEEDED,
			apiGateway.ResponseType.REQUEST_TOO_LARGE,
			apiGateway.ResponseType.RESOURCE_NOT_FOUND,
			apiGateway.ResponseType.THROTTLED,
			apiGateway.ResponseType.UNAUTHORIZED,
			apiGateway.ResponseType.UNSUPPORTED_MEDIA_TYPE,
			apiGateway.ResponseType.WAF_FILTERED
		];

		responseTypes.forEach((responseType) => {
			api.addGatewayResponse(`Default${responseType.responseType}`, {
				type: responseType,
				responseHeaders: {
					'Access-Control-Allow-Origin': `'${apiGateway.Cors.ALL_ORIGINS.join(',')}'`,
					'Access-Control-Allow-Headers': `'${apiGateway.Cors.ALL_METHODS.join(',')}'`,
					'Access-Control-Allow-Methods': `'${apiGateway.Cors.DEFAULT_HEADERS.join(',')}'`
				}
			});
		});
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
}
