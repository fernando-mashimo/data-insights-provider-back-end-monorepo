import {
	LawsuitsTimelineDataExtractionQueue,
	LawsuitTimelineDataExtractionQueueInput
} from '../../../domain/queues/lawsuitTimelineDataExtractionQueue';
import { SendMessageCommand, SendMessageCommandInput, SQSClient } from '@aws-sdk/client-sqs';

export class LawsuitsTimelineDataExtractionQueueImp implements LawsuitsTimelineDataExtractionQueue {
	private sqsClient: SQSClient;

	constructor() {
		this.sqsClient = new SQSClient({});
	}

	public async sendExtractDataMessage(
		input: LawsuitTimelineDataExtractionQueueInput
	): Promise<void> {
    const lawsuitsCnjs = input.lawsuits.map((lawsuit) => lawsuit.numero_cnj);

		const sendMessagesPromises = [];

		for (const cnj of lawsuitsCnjs) {
			const parameters: SendMessageCommandInput = {
				QueueUrl: process.env.TIMELINE_EXTRACTION_QUEUE_URL,
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
