import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';

/**
 * Default properties for the SqsConstruct.
 * Create a queue and DLQ.
 */
export class SqsBasic extends Construct {
	readonly queue: sqs.Queue;
	readonly dlq: sqs.Queue;

	constructor(scope: Construct, id: string, props: sqs.QueueProps = {}) {
		super(scope, id);

		this.dlq = new sqs.Queue(this, `DLQ`, {});

		this.queue = new sqs.Queue(this, `Queue`, {
			...props,
			deadLetterQueue: {
				maxReceiveCount: 1,
				queue: this.dlq,
				...(props?.deadLetterQueue || {})
			}
		});
	}
}
