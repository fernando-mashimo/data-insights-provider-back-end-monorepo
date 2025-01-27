import { SendMessageCommand, SendMessageCommandInput, SQSClient } from '@aws-sdk/client-sqs';
import {
	CompanyMonitoringQueue,
	CompanyMonitoringQueueInput
} from '../../../domain/queues/companyMonitoringQueue';

export class CompanyMonitoringQueueImp implements CompanyMonitoringQueue {
	private sqsClient: SQSClient;

	constructor() {
		this.sqsClient = new SQSClient({});
	}

	public async sendCreateCompanyMonitoringMessage(
		input: CompanyMonitoringQueueInput
	): Promise<void> {
		const parameters: SendMessageCommandInput = {
			QueueUrl: process.env.CREATE_COMPANY_MONITORING_QUEUE_URL,
			MessageBody: JSON.stringify(input)
		};

		const command = new SendMessageCommand(parameters);
		await this.sqsClient.send(command);
	}
}
