import { Construct } from 'constructs';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';

export type LambdaBasicProps = lambdaNodejs.NodejsFunctionProps & {};

/**
 * Create a lambda handler for NodeJs 20.x with default properties.
 */
export class LambdaBasic extends Construct {
	readonly lambda: lambdaNodejs.NodejsFunction;

	constructor(scope: Construct, id: string, props: lambdaNodejs.NodejsFunctionProps = {}) {
		super(scope, id);

		this.lambda = new lambdaNodejs.NodejsFunction(this, `Function`, {
			runtime: lambda.Runtime.NODEJS_20_X,
			memorySize: 128,
			timeout: cdk.Duration.seconds(30),

			...props,

			bundling: {
				minify: true,
				sourceMap: true,
				...(props.bundling || {})
			},
			environment: {
				NODE_ENV: process.env.NODE_ENV || 'development',
				...(props.environment || {})
			}
		});
	}
}
