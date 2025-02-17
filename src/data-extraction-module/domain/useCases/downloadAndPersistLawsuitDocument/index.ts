import { createHash } from 'node:crypto';
import { FileManagementClient } from '../../services/fileManagementClient';
import { LawsuitDataExtractorClient } from '../../services/lawsuitDataExtractorClient';
import { UseCase } from '../UseCase';
import { DownloadAndPersistLawsuitDocumentUseCaseInput } from './input';
import * as path from 'path';
import { EventDownloadAndPersistLawsuitDocument, EventDownloadAndPersistLawsuitDocumentStatus } from '../../entities/eventDownloadAndPersistLawsuitDocument';
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
      const lawsuitDocumentData: Buffer = await this.lawsuitDataExtractorClient.downloadLawsuitDocument(
        input.documentUrl
			);
      await this.persistData(input.cnj, lawsuitDocumentData);

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

	private async persistData(cnj: string, data: Buffer): Promise<void> {
		const hashedDocumentDataString = this.hashDataAndConvertToString(data);

		const filePath = path.join(
			`lawsuits/full-data/documents/escavador`,
			`${cnj}_${hashedDocumentDataString}.pdf`
		);

		await this.fileManagementClient.uploadFile(filePath, 'application/pdf', data);
	}

	private hashDataAndConvertToString(data: Buffer): string {
		const hash = createHash('sha256');

		hash.update(data);

		return hash.digest('hex');
	}
}
