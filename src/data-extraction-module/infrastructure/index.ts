import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { $config } from '$config';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSource from 'aws-cdk-lib/aws-lambda-event-sources';

export class DataExtractionStack extends cdk.Stack {
	readonly downloadExtractedLinkedinProfileQueue: sqs.Queue;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// create DynamoDB table to store data extraction events data (lawsuits and others, i.e., LinkedIn)
		const ddbTable = this.createDataExtractionEventsTable();

		// S3 bucket to store data extraction files
		const bucket = this.createS3Bucket();

		const [extractLinkedinProfileByNameFunction] = this.createSQSAndLambda(
			'extractLinkedinProfileByName',
			'src/data-extraction-module/adapters/input/sqs/extractLinkedinProfileByName/index.ts',
			'handler'
		);
		ddbTable.grantReadWriteData(extractLinkedinProfileByNameFunction);

		const [downloadExtractedLinkedinProfileFunction, queue] = this.createSQSAndLambda(
			'downloadExtractedLinkedinProfile',
			'src/data-extraction-module/adapters/input/sqs/downloadExtractedLinkedinProfile/index.ts',
			'handler'
		);
		this.downloadExtractedLinkedinProfileQueue = queue;
		ddbTable.grantReadWriteData(downloadExtractedLinkedinProfileFunction);
		bucket.grantReadWrite(downloadExtractedLinkedinProfileFunction);
	}

	private createDataExtractionEventsTable(): dynamodb.Table {
		const table = new dynamodb.Table(this, 'ExtractionEventsTable', {
			tableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			removalPolicy: cdk.RemovalPolicy.RETAIN,
			partitionKey: {
				name: 'pk',
				type: dynamodb.AttributeType.STRING
			},
			sortKey: {
				name: 'sk',
				type: dynamodb.AttributeType.STRING
			},
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
		});

		table.addGlobalSecondaryIndex({
			indexName: 'gsi-overloaded-1',
			partitionKey: {
				name: 'gsi1pk',
				type: dynamodb.AttributeType.STRING
			},
			sortKey: {
				name: 'gsi1sk',
				type: dynamodb.AttributeType.STRING
			}
		});

		return table;
	}

	private createS3Bucket(): s3.Bucket {
		const bucket = new s3.Bucket(this, 'DataExtractionBucket', {
			bucketName: $config.DATA_EXTRACTION_BUCKET_NAME,
			accessControl: s3.BucketAccessControl.PRIVATE,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			encryption: s3.BucketEncryption.S3_MANAGED
		});

		return bucket;
	}

	/**
	 * create a SQS with a DLQ for a specific lambda function
	 */
	private createSQS(name: string): sqs.Queue {
		const dlq = new sqs.Queue(this, `${name}DLQ`, {});

		const queue = new sqs.Queue(this, `${name}Queue`, {
			queueName: `${name}Queue`,
			deadLetterQueue: {
				maxReceiveCount: 1,
				queue: dlq
			}
		});

		return queue;
	}

	/**
	 * create a nodeJS 20.x lambda function
	 * with default configurations
	 */
	private createLambda(name: string, entry: string, handler: string): lambdaNodejs.NodejsFunction {
		return new lambdaNodejs.NodejsFunction(this, `${name}Function`, {
			functionName: `${name}Function`,
			description: '',
			entry: entry,
			handler: handler,
			runtime: lambda.Runtime.NODEJS_20_X,
			memorySize: 128,
			timeout: cdk.Duration.seconds(30),
			bundling: {
				minify: true,
				sourceMap: true
			}
		});
	}

	/**
	 * create a nodeJS 20.x lambda function
	 * triggered by a SQS queue with a DLQ
	 * with default configurations
	 */
	private createSQSAndLambda(
		name: string,
		entry: string,
		handler: string
	): [lambdaNodejs.NodejsFunction, sqs.Queue] {
		const queue = this.createSQS(name);
		const lambda = this.createLambda(name, entry, handler);

		lambda.addEventSource(
			new lambdaEventSource.SqsEventSource(queue, {
				batchSize: 1,
				enabled: true,
				maxBatchingWindow: cdk.Duration.seconds(30)
			})
		);

		queue.grantConsumeMessages(lambda);
		return [lambda, queue];
	}
}
