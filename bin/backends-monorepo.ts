#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuthzStack } from '../src/authz-module/infrastructure';
import { DomainStack } from '../src/domain-module/infrastructure';

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
