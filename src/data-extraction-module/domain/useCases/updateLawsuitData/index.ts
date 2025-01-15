import * as path from 'path';
import { FileManagementClient } from '../../services/fileManagementClient';
import { UseCase } from '../UseCase';
import { UpdateLawsuitDataUseCaseInput } from './input';
import { EventUpdateLawsuit, EventUpdateLawsuitStatus } from '../../entities/eventUpdateLawsuit';
import {
	GenericExtractedData,
	LawsuitDataUpdateClient
} from '../../services/lawsuitDataUpdateClient';
import { EventUpdateLawsuitRepository } from '../../repositories/eventUpdateLawsuitRepository';

export class UpdateLawsuitDataUseCase implements UseCase<UpdateLawsuitDataUseCaseInput, void> {
	private lawsuitDataUpdateClient: LawsuitDataUpdateClient;
	private fileManagementClient: FileManagementClient;
	private eventUpdateLawsuitRepository: EventUpdateLawsuitRepository;

	constructor(
		lawsuitDataUpdateClient: LawsuitDataUpdateClient,
		fileManagementClient: FileManagementClient,
		eventUpdateLawsuitRepository: EventUpdateLawsuitRepository
	) {
		this.lawsuitDataUpdateClient = lawsuitDataUpdateClient;
		this.fileManagementClient = fileManagementClient;
		this.eventUpdateLawsuitRepository = eventUpdateLawsuitRepository;
	}

	public async execute(input: UpdateLawsuitDataUseCaseInput): Promise<void> {
		try {
			const lawsuitSubscriptionData = await this.lawsuitDataUpdateClient.getLawsuitSubscription(
				input.cnj
			);

			const event: EventUpdateLawsuit = new EventUpdateLawsuit(
				input.cnj,
				EventUpdateLawsuitStatus.PENDING,
				new Date()
			);

			if (!lawsuitSubscriptionData) {
				await this.lawsuitDataUpdateClient.createLawsuitSubscription(input.cnj);
				await this.eventUpdateLawsuitRepository.put(event);

				return;
			}

			const updatedLawsuitDataAndDocumentsUrl =
				await this.lawsuitDataUpdateClient.getUpdatedLawsuitData(lawsuitSubscriptionData.id);

			// persist updated lawsuit data on S3
			await this.persistUpdatedLawsuitData(
				input.cnj,
				updatedLawsuitDataAndDocumentsUrl.updatedData
			);
			// download and persist lawsuit documents on S3
			await this.downloadLawsuitDocumentsAndPersist(
				updatedLawsuitDataAndDocumentsUrl.documentsUrls,
				input.cnj
			);

			event.status = EventUpdateLawsuitStatus.FINISHED;
			event.endDate = new Date();
			await this.eventUpdateLawsuitRepository.put(event);
		} catch (error) {
			console.error(`Cannot update data for lawsuit with CNJ ${input.cnj}`, error);
			throw error;
		}
	}

	private async persistUpdatedLawsuitData(
		cnj: string,
		updatedLawsuitData: GenericExtractedData[]
	): Promise<void> {
		const filePath = path.join(`lawsuits/update/piped`, `${cnj}_${new Date().toISOString()}.json`);

		await this.fileManagementClient.uploadFile(
			filePath,
			'application/json',
			Buffer.from(JSON.stringify(updatedLawsuitData))
		);
	}

	private async downloadLawsuitDocumentsAndPersist(
		documentsUrls: string[],
		cnj: string
	): Promise<void> {
		for (const documentUrl of documentsUrls) {
			if (documentUrl) {
				const documentData = await this.fileManagementClient.downloadPdfFile(documentUrl);

				const filePath = path.join(
					`lawsuits/documents/piped`,
					`${cnj}_${new Date().toISOString()}.pdf`
				);

				await this.fileManagementClient.uploadFile(filePath, 'application/pdf', documentData);
			}
		}
	}
}
