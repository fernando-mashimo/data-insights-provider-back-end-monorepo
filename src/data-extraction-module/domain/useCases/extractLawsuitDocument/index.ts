import { createHash } from 'node:crypto';
import { EventExtractLawsuitDocumentAsyncStatus } from '../../entities/eventExtractLawsuitDocumentAsync';
import { LawsuitDocumentDownloadAndPersistQueue } from '../../queues/lawsuitDocumentExtractionQueue';
import { EventExtractLawsuitDocumentAsyncRepository } from '../../repositories/eventExtractLawsuitDocumentAsyncRepository';
import { FileManagementClient } from '../../services/fileManagementClient';
import { UseCase } from '../UseCase';
import { ExtractLawsuitDocumentUseCaseInput } from './input';
import * as path from 'path';

export class ExtractLawsuitDocumentUseCase
	implements UseCase<ExtractLawsuitDocumentUseCaseInput, void>
{
	private EventExtractLawsuitDocumentAsyncRepository: EventExtractLawsuitDocumentAsyncRepository;
	private lawsuitDocumentDownloadAndPersistQueue: LawsuitDocumentDownloadAndPersistQueue;
	private fileManagementClient: FileManagementClient;

	constructor(
		EventExtractLawsuitDocumentAsyncRepository: EventExtractLawsuitDocumentAsyncRepository,
		lawsuitDocumentDownloadAndPersistQueue: LawsuitDocumentDownloadAndPersistQueue,
		fileManagementClient: FileManagementClient
	) {
		this.EventExtractLawsuitDocumentAsyncRepository = EventExtractLawsuitDocumentAsyncRepository;
		this.lawsuitDocumentDownloadAndPersistQueue = lawsuitDocumentDownloadAndPersistQueue;
		this.fileManagementClient = fileManagementClient;
	}

	public async execute(input: ExtractLawsuitDocumentUseCaseInput): Promise<void> {
		try {
			const event = await this.EventExtractLawsuitDocumentAsyncRepository.getByCnjAndExternalId(
				input.cnj,
				input.asyncProcessExternalId
			);

			const sendMessagePromises = [];
			for (const documentUrl of input.lawsuitDocumentsUrls) {
				sendMessagePromises.push(
					this.lawsuitDocumentDownloadAndPersistQueue.sendDownloadAndPersistDocumentMessage(
						input.cnj,
						input.asyncProcessExternalId,
						documentUrl
					)
				);
			}
			await Promise.all([
				...sendMessagePromises,
				this.persistData(input.cnj, input.lawsuitData)
			]);

			event.endDate = new Date();
			event.status = EventExtractLawsuitDocumentAsyncStatus.FINISHED;
			await this.EventExtractLawsuitDocumentAsyncRepository.put(event);
		} catch (error) {
			console.error(`Cannot extract lawsuit document for lawsuit with CNJ ${input.cnj}`, error);
			throw error;
		}
	}

	private async persistData(
		cnj: string,
		data: { [key: string]: string | number | boolean | object | null }
	): Promise<void> {
		const hashedDataString = this.hashDataAndConvertToString(Buffer.from(JSON.stringify(data)));
		const filePath = path.join(
			`lawsuits/full-data/main/escavador`,
			`${cnj}_${hashedDataString}.json`
		);

		await this.fileManagementClient.uploadFile(
			filePath,
			'application/json',
			Buffer.from(JSON.stringify(data))
		);
	}

	private hashDataAndConvertToString(data: Buffer): string {
		const hash = createHash('sha256');

		hash.update(data);

		return hash.digest('hex');
	}
}
