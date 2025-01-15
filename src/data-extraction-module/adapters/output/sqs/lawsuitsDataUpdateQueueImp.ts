import { SendMessageCommand, SendMessageCommandInput, SQSClient } from '@aws-sdk/client-sqs';
import {
	LawsuitsDataUpdateQueue,
	LawsuitsDataUpdateQueueInput
} from '../../../domain/queues/lawsuitDataUpdateQueue';

export class LawsuitsDataUpdateQueueImp implements LawsuitsDataUpdateQueue {
	private sqsClient: SQSClient;

	constructor() {
		this.sqsClient = new SQSClient({});
	}

	public async sendUpdateDataMessages(input: LawsuitsDataUpdateQueueInput): Promise<void> {
		const lawsuitsCnjs = input.lawsuits.map((lawsuit) => lawsuit.numero_cnj ?? lawsuit.cnj);

		const sendMessagesPromises = [];

		for (const cnj of lawsuitsCnjs) {
			const parameters: SendMessageCommandInput = {
				QueueUrl: process.env.UPDATE_LAWSUIT_DATA_QUEUE_URL,
				MessageBody: JSON.stringify({
					cnj
				})
			};

			const command = new SendMessageCommand(parameters);
			sendMessagesPromises.push(this.sqsClient.send(command));
		}

		await Promise.all(sendMessagesPromises);
	}
}
