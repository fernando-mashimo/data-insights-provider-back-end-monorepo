import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { $config } from '$config';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { EventListener } from '$lib/infrastructure/constructors/eventListener';
import { LambdaBasic } from '$lib/infrastructure/constructors/lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { EventRuleBasic } from '$lib/infrastructure/constructors/eventRule';

export class DataExtractionStack extends cdk.Stack {
	readonly downloadExtractedLinkedinProfileQueue: sqs.Queue;
	readonly handleCompanyMonitoringReceivedDataQueue: sqs.Queue;

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
		const extractLawsuitsTimelineDataQueue = this.setupExtractLawsuitsTimelineData();
		const updateLawsuitDataQueue = this.setupUpdateLawsuitData();
		const createCompanyMonitoringQueue = this.setupCreateCompanyMonitoring();
		this.setupExtractLawsuitData(
			extractLawsuitsTimelineDataQueue,
			updateLawsuitDataQueue,
			createCompanyMonitoringQueue
		);
		const triggerUpdateLawsuitDataFunction =
			this.setupTriggerUpdateLawsuitData(updateLawsuitDataQueue);
		this.setupDailyTriggerForUpdateLawsuitData(triggerUpdateLawsuitDataFunction);
		this.handleCompanyMonitoringReceivedDataQueue = this.setupHandleCompanyMonitoringReceivedData();
		this.setupExtractPersonData();
    this.setupUpdateLawsuitDataAsync();
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

	private setupExtractLawsuitData(
		timelineExtractionQueue: sqs.Queue,
		updateLawsuitDataQueue: sqs.Queue,
		createCompanyMonitoringQueue: sqs.Queue
	) {
		const { lambda } = new EventListener(this, 'ExtractLawsuitData', {
			lambdaProps: {
				entry: 'src/data-extraction-module/adapters/input/sqs/extractLawsuitData/index.ts',
				handler: 'handler',
				environment: {
					TIMELINE_EXTRACTION_QUEUE_URL: timelineExtractionQueue.queueUrl,
					UPDATE_LAWSUIT_DATA_QUEUE_URL: updateLawsuitDataQueue.queueUrl,
					CREATE_COMPANY_MONITORING_QUEUE_URL: createCompanyMonitoringQueue.queueUrl
				},
				timeout: cdk.Duration.seconds(900)
			},
			sqsEventSourceProps: {
				batchSize: 1,
				maxBatchingWindow: cdk.Duration.seconds(300)
			}
		});
		this.ddbTable.grantReadWriteData(lambda);
		this.bucket.grantReadWrite(lambda);
		timelineExtractionQueue.grantSendMessages(lambda);
		updateLawsuitDataQueue.grantSendMessages(lambda);
		createCompanyMonitoringQueue.grantSendMessages(lambda);
	}

	private setupExtractLawsuitsTimelineData() {
		const { lambda, queue } = new EventListener(this, 'ExtractLawsuitTimelineData', {
			lambdaProps: {
				entry: 'src/data-extraction-module/adapters/input/sqs/extractLawsuitTimelineData/index.ts',
				handler: 'handler'
			},
			sqsEventSourceProps: {
				batchSize: 1,
				maxBatchingWindow: cdk.Duration.seconds(300)
			}
		});
		this.ddbTable.grantReadWriteData(lambda);
		this.bucket.grantReadWrite(lambda);

		return queue;
	}

	private setupUpdateLawsuitData() {
		const { lambda, queue } = new EventListener(this, 'UpdateLawsuitData', {
			lambdaProps: {
				entry: 'src/data-extraction-module/adapters/input/sqs/updateLawsuitData/index.ts',
				handler: 'handler',
				memorySize: 256
			},
			sqsEventSourceProps: {
				batchSize: 1,
				maxBatchingWindow: cdk.Duration.seconds(300)
			}
		});
		this.ddbTable.grantReadWriteData(lambda);
		this.bucket.grantReadWrite(lambda);

		return queue;
	}

	private setupTriggerUpdateLawsuitData(
		updateLawsuitDataQueue: sqs.Queue
	): lambdaNodejs.NodejsFunction {
		const { lambda } = new LambdaBasic(this, 'TriggerUpdateLawsuitData', {
			timeout: cdk.Duration.seconds(900),
			entry: 'src/data-extraction-module/adapters/input/schedule/triggerUpdateLawsuitData/index.ts',
			handler: 'handler',
			environment: {
				UPDATE_LAWSUIT_DATA_QUEUE_URL: updateLawsuitDataQueue.queueUrl
			}
		});
		updateLawsuitDataQueue.grantSendMessages(lambda);

		return lambda;
	}

	private setupDailyTriggerForUpdateLawsuitData(
		triggerUpdateLawsuitDataLambda: lambdaNodejs.NodejsFunction
	) {
		const { eventRule } = new EventRuleBasic(this, 'EventRuleUpdateLawsuitData', {});

		eventRule.addTarget(new targets.LambdaFunction(triggerUpdateLawsuitDataLambda));
	}

	private setupCreateCompanyMonitoring() {
		const { lambda, queue } = new EventListener(this, 'CreateCompanyMonitoring', {
			lambdaProps: {
				entry: 'src/data-extraction-module/adapters/input/sqs/createCompanyMonitoring/index.ts',
				handler: 'handler'
			},
			sqsEventSourceProps: {
				batchSize: 1
			}
		});

		this.ddbTable.grantReadWriteData(lambda);

		return queue;
	}

	private setupHandleCompanyMonitoringReceivedData() {
		const { lambda, queue } = new EventListener(this, 'HandleCompanyMonitoringReceivedData', {
			lambdaProps: {
				entry:
					'src/data-extraction-module/adapters/input/sqs/handleCompanyMonitoringReceivedData/index.ts',
				handler: 'handler'
			},
			sqsEventSourceProps: {
				batchSize: 1
			}
		});

		this.ddbTable.grantReadWriteData(lambda);
		this.bucket.grantReadWrite(lambda);

		return queue;
	}

	private setupExtractPersonData(): void {
		const { lambda } = new EventListener(this, 'ExtractPersonData', {
			lambdaProps: {
				entry: 'src/data-extraction-module/adapters/input/sqs/extractPersonData/index.ts',
				handler: 'handler'
			},
			sqsEventSourceProps: {
				batchSize: 1
			}
		});

		this.ddbTable.grantReadWriteData(lambda);
		this.bucket.grantReadWrite(lambda);
	}

  private setupUpdateLawsuitDataAsync(): void {
    const { lambda } = new EventListener(this, 'UpdateLawsuitDataAsync', {
      lambdaProps: {
        entry: 'src/data-extraction-module/adapters/input/sqs/updateLawsuitDataAsync/index.ts',
        handler: 'handler'
      },
      sqsEventSourceProps: {
        batchSize: 1
      }
    });

    this.ddbTable.grantReadWriteData(lambda);
  }
}
