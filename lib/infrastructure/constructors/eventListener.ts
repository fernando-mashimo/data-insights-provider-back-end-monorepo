import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import { SqsBasic } from './sqs';
import { LambdaBasic } from './lambda';
import * as cdk from 'aws-cdk-lib';
import * as lambdaEventSource from 'aws-cdk-lib/aws-lambda-event-sources';

export type EventListenerProps = {
	queueProps?: sqs.QueueProps;
	lambdaProps?: lambdaNodejs.NodejsFunctionProps;
	sqsEventSourceProps?: lambdaEventSource.SqsEventSourceProps;
};

/**
 * This is a basic implementation of a EventListener.
 * Create an SQS with DLQ pointing to a Lambda function.
 */
export class EventListener extends Construct {
	readonly queue: sqs.Queue;
	readonly dlq: sqs.Queue;
	readonly lambda: lambdaNodejs.NodejsFunction;

	constructor(scope: Construct, id: string, props: EventListenerProps) {
		super(scope, id);

		const batchSize = props?.sqsEventSourceProps?.batchSize || 1;

		const maxBatchingWindow =
			props?.sqsEventSourceProps?.maxBatchingWindow || cdk.Duration.seconds(30);

		const maxLambdaConcurrentExecutions =
			props?.lambdaProps?.reservedConcurrentExecutions || undefined;

		// SQS visibility timeout must be greater than or equal the lambda timeout
		const maxTimeout = props?.lambdaProps?.timeout || cdk.Duration.seconds(30);

		const { queue, dlq } = new SqsBasic(this, `SQS`, {
			visibilityTimeout: maxTimeout,
			...props.queueProps
		});
		const { lambda } = new LambdaBasic(this, `Lambda`, {
			timeout: maxTimeout,
			reservedConcurrentExecutions: maxLambdaConcurrentExecutions,
			...props.lambdaProps
		});

		this.queue = queue;
		this.dlq = dlq;
		this.lambda = lambda;

		lambda.addEventSource(
			new lambdaEventSource.SqsEventSource(queue, {
				batchSize,
				enabled: true,
				maxBatchingWindow,
				...(props?.sqsEventSourceProps || {})
			})
		);

		queue.grantConsumeMessages(lambda);
	}
}
