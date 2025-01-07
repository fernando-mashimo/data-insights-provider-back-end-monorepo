#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuthzStack } from '../src/authz-module/infrastructure';
import { DomainStack } from '../src/domain-module/infrastructure';
import { ApiGatewayStack } from '../src/api-gateway-module/infrastructure';
import { MetabaseStack } from '../src/metabase-module/infrastructure';
import { DataExtractionStack } from '../src/data-extraction-module/infrastructure';

const app = new cdk.App();

const prodEnv: cdk.Environment = {
	account: '225989342294',
	region: 'us-east-1'
};

const domainStack = new DomainStack(app, 'DomainStack', {
	env: prodEnv,
	tags: {
		module: 'domain-module'
	},
	description: 'Configure SES domain identity, DKIM records, and others related to domain'
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
	userPool: authzStack.userPool
});
apiGatewayStack.addDependency(metabaseStack);
apiGatewayStack.addDependency(authzStack);
apiGatewayStack.addDependency(dataExtractionStack);
