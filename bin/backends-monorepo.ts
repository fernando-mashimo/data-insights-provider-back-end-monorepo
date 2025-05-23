#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuthzStack } from '../src/authz-module/infrastructure';
import { DomainStack } from '../src/domain-module/infrastructure';
import { ApiGatewayStack } from '../src/api-gateway-module/infrastructure';
import { MetabaseStack } from '../src/metabase-module/infrastructure';
import { DataExtractionStack } from '../src/data-extraction-module/infrastructure';
import { GlobalAlarmsModule } from '../src/global-alarms-module/infrastructure';
import { $config } from '../src/config';
const app = new cdk.App();

const prodEnv: cdk.Environment = {
	account: $config.AWS_ACCOUNT_ID,
	region: $config.AWS_REGION
};

const domainStack = new DomainStack(app, 'DomainStack', {
	env: prodEnv,
	tags: {
		module: 'domain-module'
	},
	description: 'Configure SES domain identity, DKIM records, and others related to domain'
});

new GlobalAlarmsModule(app, 'GlobalAlarmsStack', {
	env: prodEnv,
	tags: {
		module: 'global-alarms-module'
	},
	description: 'Configure metrics and alarms for aws services at global level.'
});

const authzStack = new AuthzStack(app, 'AuthzStack', {
	env: prodEnv,
	tags: {
		module: 'authz-module'
	},
	description: 'Configure Cognito User Pool, custom emails, and others'
});
authzStack.addDependency(domainStack);

const metabaseStack = new MetabaseStack(app, 'MetabaseStack', {
	env: prodEnv,
	tags: {
		module: 'metabase-module'
	},
	description: 'Deploy Metabase and db on EC2 instance'
});

const dataExtractionStack = new DataExtractionStack(app, 'DataExtractionStack', {
	env: prodEnv,
	tags: {
		module: 'data-extraction-module'
	},
	description: 'Configure data extraction resources'
});

const apiGatewayStack = new ApiGatewayStack(app, 'ApiGatewayStack', {
	env: prodEnv,
	tags: {
		module: 'api-gateway-module'
	},
	description: 'Configure API Gateway',
	getEmbedUrlHandler: metabaseStack.getEmbedUrlHandler,
	downloadExtractedLinkedinProfileQueue: dataExtractionStack.downloadExtractedLinkedinProfileQueue,
	handleEscavadorCallbackResponseQueue: dataExtractionStack.handleEscavadorCallbackResponseQueue,
	userPool: authzStack.userPool
});
apiGatewayStack.addDependency(metabaseStack);
apiGatewayStack.addDependency(authzStack);
apiGatewayStack.addDependency(dataExtractionStack);
