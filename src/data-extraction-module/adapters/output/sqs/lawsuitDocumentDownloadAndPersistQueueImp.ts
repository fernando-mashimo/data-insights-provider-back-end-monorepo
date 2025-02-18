import { SendMessageCommand, SendMessageCommandInput, SQSClient } from '@aws-sdk/client-sqs';
import { LawsuitDocumentDownloadAndPersistQueue } from '../../../domain/queues/lawsuitDocumentExtractionQueue';

export class LawsuitDocumentDownloadAndPersistQueueImp
	implements LawsuitDocumentDownloadAndPersistQueue
{
	private sqsClient: SQSClient;

	constructor() {
		this.sqsClient = new SQSClient({});
	}

	public async sendDownloadAndPersistDocumentMessage(
		cnj: string,
		externalId: string,
		documentData: { url: string, fileHash: string},
	): Promise<void> {
		const parameter: SendMessageCommandInput = {
			QueueUrl: process.env.DOWNLOAD_AND_PERSIST_LAWSUIT_DOCUMENT_QUEUE_URL,
			MessageBody: JSON.stringify({
				cnj,
				externalId,
				documentData
			})
		};

		const command = new SendMessageCommand(parameter);
		await this.sqsClient.send(command);
	}
}
