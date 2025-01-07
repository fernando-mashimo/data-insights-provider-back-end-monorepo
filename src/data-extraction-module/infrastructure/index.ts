import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { $config } from '$config';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { EventListener } from '$lib/infrastructure/constructors/eventListener';

export class DataExtractionStack extends cdk.Stack {
	readonly downloadExtractedLinkedinProfileQueue: sqs.Queue;

	private readonly ddbTable: dynamodb.Table;
	private readonly bucket: s3.Bucket;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// create DynamoDB table to store data extraction events data (lawsuits and others, i.e., LinkedIn)
		this.ddbTable = this.createDataExtractionEventsTable();

		// S3 bucket to store data extraction files
		this.bucket = this.createS3Bucket();

		this.downloadExtractedLinkedinProfileQueue = this.setUpDownloadExtractedLinkedinProfile();
		this.setupExtractLinkedinProfileByName();
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
			removalPolicy: cdk.RemovalPolicy.RETAIN,
			encryption: s3.BucketEncryption.S3_MANAGED
		});

		return bucket;
	}

	private setUpDownloadExtractedLinkedinProfile(): sqs.Queue {
		const { lambda, queue } = new EventListener(this, 'DownloadExtractedLinkedinProfile', {
			lambdaProps: {
				entry:
					'src/data-extraction-module/adapters/input/sqs/downloadExtractedLinkedinProfile/index.ts',
				handler: 'handler'
			},
			sqsEventSourceProps: {
				batchSize: 1,
				maxBatchingWindow: cdk.Duration.seconds(30)
			}
		});
		this.ddbTable.grantReadWriteData(lambda);
		this.bucket.grantReadWrite(lambda);

		return queue;
	}

	private setupExtractLinkedinProfileByName() {
		const { lambda } = new EventListener(this, 'ExtractLinkedinProfileByName', {
			lambdaProps: {
				entry:
					'src/data-extraction-module/adapters/input/sqs/extractLinkedinProfileByName/index.ts',
				handler: 'handler'
			},
			sqsEventSourceProps: {
				batchSize: 1
			}
		});
		this.ddbTable.grantReadWriteData(lambda);
	}
}
