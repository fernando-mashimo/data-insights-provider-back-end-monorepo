import { FileManagementClient } from '../../services/fileManagementClient';
import { LawsuitDataExtractorClient } from '../../services/lawsuitDataExtractorClient';
import { UseCase } from '../UseCase';
import { DownloadAndPersistLawsuitDocumentUseCaseInput } from './input';
import * as path from 'path';
import {
	EventDownloadAndPersistLawsuitDocument,
	EventDownloadAndPersistLawsuitDocumentStatus
} from '../../entities/eventDownloadAndPersistLawsuitDocument';
import { EventDownloadAndPersistLawsuitDocumentRepository } from '../../repositories/eventDownloadAndPersistLawsuitDocumentRepository';

export class DownloadAndPersistLawsuitDocumentUseCase
	implements UseCase<DownloadAndPersistLawsuitDocumentUseCaseInput, void>
{
	private eventDownloadAndPersistLawsuitDocumentRepository: EventDownloadAndPersistLawsuitDocumentRepository;
	private lawsuitDataExtractorClient: LawsuitDataExtractorClient;
	fileManagementClient: FileManagementClient;

	constructor(
		eventDownloadAndPersistLawsuitDocumentRepository: EventDownloadAndPersistLawsuitDocumentRepository,
		lawsuitDataExtractorClient: LawsuitDataExtractorClient,
		fileManagementClient: FileManagementClient
	) {
		this.eventDownloadAndPersistLawsuitDocumentRepository =
			eventDownloadAndPersistLawsuitDocumentRepository;
		this.lawsuitDataExtractorClient = lawsuitDataExtractorClient;
		this.fileManagementClient = fileManagementClient;
	}

	public async execute(input: DownloadAndPersistLawsuitDocumentUseCaseInput): Promise<void> {
		try {
			const lawsuitDocumentData: Buffer =
				await this.lawsuitDataExtractorClient.downloadLawsuitDocument(input.url);
			await this.persistData(input.cnj, input.fileHash, lawsuitDocumentData);

			const event = new EventDownloadAndPersistLawsuitDocument(input.cnj, input.externalId);
			event.endDate = new Date();
			event.status = EventDownloadAndPersistLawsuitDocumentStatus.FINISHED;
			await this.eventDownloadAndPersistLawsuitDocumentRepository.put(event);
		} catch (error) {
			console.error(
				`Cannot download and persist lawsuit document for lawsuit with CNJ ${input.cnj}`,
				error
			);
			throw error;
		}
	}

	private async persistData(cnj: string, fileHash: string, data: Buffer): Promise<void> {
		const filePath = path.join(
			`lawsuits/full-data/documents/escavador`,
			`${cnj}_${fileHash}.pdf`
		);

		await this.fileManagementClient.uploadFile(filePath, 'application/pdf', data);
	}
}
