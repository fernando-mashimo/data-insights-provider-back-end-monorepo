import { Construct } from 'constructs';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as IAM from 'aws-cdk-lib/aws-iam';

export type RestApiBuilderProps = apiGateway.RestApiProps & {
	userPool: cognito.IUserPool;
};

export enum DefaultConfigurations {
	ENABLED_CORS,
	AUTHENTICATED
}

type AcceptedHandlers = lambdaNodejs.NodejsFunction | sqs.Queue;

/**
 * Auxiliar type to define the resources and methods of the api gateway.
 * Don´t support definition on / path
 */
type GatewayResourcesDefinition = {
	resourceOptions?: apiGateway.ResourceOptions;
	integrations?: {
		method: string;
		integration: apiGateway.AwsIntegration;
		methodOptions?: apiGateway.MethodOptions;
	}[];

	nested?: {
		[resourceName: string]: GatewayResourcesDefinition;
	};
};

type ResourceAndMethodOptions = {
	resourceOptions?: apiGateway.ResourceOptions;
	methodOptions?: apiGateway.MethodOptions;
};

/**
 * This class is a builder for api gateway RestApi.
 * This construct implements a fluent interface to create resources and methods
 * attached to the following integrations:
 * - Lambda as proxy integration
 * - SQS, to be used as a webhook listener, the request body is sent as a message to the queue, and the response is an empty object
 *
 * The class also creates a Cognito User Pools Authorizer to protect the API resources.
 * But you can also pass a custom ResourceOptions
 */
export class RestApiBuilder {
	private resourcesDefinition: GatewayResourcesDefinition = {};
	private authorizer: apiGateway.CognitoUserPoolsAuthorizer;
	private api: apiGateway.RestApi;

	private readonly scope: Construct;

	static create(scope: Construct, id: string, props: RestApiBuilderProps): RestApiBuilder {
		return new RestApiBuilder(scope, id, props);
	}

	public post(
		path: string,
		handler: AcceptedHandlers,
		options?: ResourceAndMethodOptions | DefaultConfigurations[]
	): RestApiBuilder {
		return this.addResourceDefinition('POST', path, handler, options);
	}

	public get(
		path: string,
		handler: AcceptedHandlers,
		options?: ResourceAndMethodOptions | DefaultConfigurations[]
	): RestApiBuilder {
		return this.addResourceDefinition('GET', path, handler, options);
	}

	public put(
		path: string,
		handler: AcceptedHandlers,
		options?: ResourceAndMethodOptions | DefaultConfigurations[]
	): RestApiBuilder {
		return this.addResourceDefinition('PUT', path, handler, options);
	}

	public delete(
		path: string,
		handler: AcceptedHandlers,
		options?: ResourceAndMethodOptions | DefaultConfigurations[]
	): RestApiBuilder {
		return this.addResourceDefinition('DELETE', path, handler, options);
	}

	public build(): apiGateway.RestApi {
		this.createResourceAndMethods();
		return this.api;
	}

	private createSqsIntegration(queue: sqs.Queue): apiGateway.AwsIntegration {
		// role
		const integrationRole = new IAM.Role(
			this.scope,
			`${queue.node.scopes.map((x) => x.node.id).join('')}IntegrationRole`,
			{
				assumedBy: new IAM.ServicePrincipal('apigateway.amazonaws.com')
			}
		);

		// grant sqs:SendMessage* to Api Gateway Role
		queue.grantSendMessages(integrationRole);

		return new apiGateway.AwsIntegration({
			service: 'sqs',
			integrationHttpMethod: 'POST',
			path: queue.queueName,
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
	}

	private createLambdaIntegration(
		lambda: lambdaNodejs.NodejsFunction
	): apiGateway.LambdaIntegration {
		return new apiGateway.LambdaIntegration(lambda);
	}

	private addResourceDefinition(
		method: string,
		path: string,
		handler: AcceptedHandlers,
		options?: ResourceAndMethodOptions | DefaultConfigurations[]
	): RestApiBuilder {
		let integration: apiGateway.AwsIntegration;
		let methodOptions: apiGateway.MethodOptions;
		let resourceOptions: apiGateway.ResourceOptions;

		// configuration based on handler type
		if (handler instanceof lambdaNodejs.NodejsFunction) {
			integration = this.createLambdaIntegration(handler);
			methodOptions = {};
			resourceOptions = {};
		} else if (handler instanceof sqs.Queue) {
			integration = this.createSqsIntegration(handler);
			resourceOptions = {};
			methodOptions = {
				methodResponses: [
					{
						statusCode: '200'
					}
				]
			};
		} else {
			throw new Error('Handler type not supported');
		}

		if (options instanceof Array) {
			// merge configuration with presets
			const defaultOptions = this.getResourceAndMethodOptionsFromDefaults(options);
			methodOptions = {
				...methodOptions,
				...(defaultOptions.methodOptions || {})
			};
			resourceOptions = {
				...resourceOptions,
				...(defaultOptions.resourceOptions || {})
			};
		} else {
			// merge configuration with custom options
			methodOptions = {
				...methodOptions,
				...(options?.methodOptions || {})
			};
			resourceOptions = {
				...resourceOptions,
				...(options?.resourceOptions || {})
			};
		}

		const resources = path.split('/').filter((p) => p !== '');
		let parentResourceDef = this.resourcesDefinition;
		resources.forEach((resource, idx) => {
			const isLastResource = idx === resources.length - 1;

			// initialize the nested resources object
			if (!parentResourceDef.nested) {
				parentResourceDef.nested = {};
			}

			// add the method to the resource
			if (isLastResource) {
				let currentResourceDef = structuredClone(parentResourceDef.nested?.[resource]) || {};
				currentResourceDef = {
					...currentResourceDef,
					resourceOptions,
					integrations: [
						...(currentResourceDef.integrations || []),
						{
							method,
							integration,
							methodOptions
						}
					]
				};
				parentResourceDef.nested[resource] = currentResourceDef;
			} else if (!(resource in parentResourceDef.nested)) {
				// add the resource to the parent resource
				parentResourceDef.nested[resource] = {};
			}

			parentResourceDef = parentResourceDef.nested[resource];
		});

		return this;
	}

	private getResourceAndMethodOptionsFromDefaults(
		defaults: DefaultConfigurations[]
	): ResourceAndMethodOptions {
		let resourceOptions: apiGateway.ResourceOptions = {};
		let methodOptions: apiGateway.MethodOptions = {};

		for (const def of defaults) {
			switch (def) {
				case DefaultConfigurations.AUTHENTICATED:
					methodOptions = {
						...methodOptions,
						authorizer: this.authorizer,
						authorizationType: apiGateway.AuthorizationType.COGNITO
					};
					break;
				case DefaultConfigurations.ENABLED_CORS:
					resourceOptions = {
						...resourceOptions,
						defaultCorsPreflightOptions: {
							allowOrigins: apiGateway.Cors.ALL_ORIGINS,
							allowMethods: apiGateway.Cors.ALL_METHODS,
							allowHeaders: apiGateway.Cors.DEFAULT_HEADERS
						}
					};
					break;
				default:
					throw new Error('Default configuration not supported');
			}
		}

		return {
			resourceOptions,
			methodOptions
		};
	}

	private createResourceAndMethods(): void {
		const stack: {
			resourceDef: GatewayResourcesDefinition;
			resourceName: string;
			parentResource?: apiGateway.IResource;
		}[] = [{ resourceDef: this.resourcesDefinition, resourceName: '/', parentResource: undefined }];

		while (stack.length > 0) {
			const { resourceDef, resourceName, parentResource } = stack.pop()!;
			let resource: apiGateway.IResource;

			// create the resource
			if (parentResource) {
				resource = parentResource.addResource(resourceName, resourceDef.resourceOptions);
			} else {
				resource = this.api.root;

				if (resourceDef.resourceOptions) {
					throw new Error('Resource options not supported on root resource');
				}
			}

			// create the methods
			if (resourceDef.integrations) {
				for (const { method, integration, methodOptions } of resourceDef.integrations) {
					resource.addMethod(method, integration, methodOptions);
				}
			}

			// stack the nested resources to be created
			if (resourceDef.nested) {
				for (const nestedResourceName in resourceDef.nested) {
					stack.push({
						resourceDef: resourceDef.nested[nestedResourceName],
						resourceName: nestedResourceName,
						parentResource: resource
					});
				}
			}
		}
	}

	private constructor(scope: Construct, id: string, props: RestApiBuilderProps) {
		this.scope = scope;
		this.api = new apiGateway.RestApi(this.scope, id, props);

		this.authorizer = new apiGateway.CognitoUserPoolsAuthorizer(this.api, 'ApiGatewayAuthorizer', {
			cognitoUserPools: [props.userPool]
		});
	}
}
