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
import { createHash } from 'node:crypto';

/**
 * Use case to update / fetch additional lawsuit data from external source (currently PIPED API)
 *
 * The use case is responsible for:
 * - Fetching lawsuit subscription data from PIPED API
 *   - If no subscription is found, it sends a request to create a new one and finishes the process
 * - Fetching updated lawsuit data from PIPED API
 * - Persisting updated lawsuit data on S3
 * - Downloading and persisting lawsuit documents on S3 (hashed content as part of persisted file name)
 * - Updating event status on EventUpdateLawsuitRepository
 *
 */
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
			let event: EventUpdateLawsuit;
			const existingEvents = await this.eventUpdateLawsuitRepository.getByCnjAndStatus(
				input.cnj,
				EventUpdateLawsuitStatus.PENDING
			);
			if (!existingEvents.length)
				event = new EventUpdateLawsuit(input.cnj, EventUpdateLawsuitStatus.PENDING, new Date());
			else event = existingEvents[0];

      // checks if CNJ has a monitoring subscription at external source
      // if not, creates a new subscription and finishes the process
			const lawsuitSubscriptionData =
				await this.lawsuitDataUpdateClient.getLawsuitSubscriptionByCnj(input.cnj);
			if (!lawsuitSubscriptionData) {
				await this.lawsuitDataUpdateClient.createLawsuitSubscription(input.cnj);
				await this.eventUpdateLawsuitRepository.put(event);

				return;
			}

      // checks if lawsuit data has already been updated
      // if so, finishes the process
			const isLawsuitDataAlreadyUpdated = await this.verifyIfLawsuitDataIsAlreadyUpdated(input.cnj);
			if (isLawsuitDataAlreadyUpdated) {
				event.status = EventUpdateLawsuitStatus.FINISHED_ALREADY_UPDATED;
				event.endDate = new Date();
				await this.eventUpdateLawsuitRepository.put(event);

				return;
			}

			const updatedLawsuitDataAndDocumentsUrl =
				await this.lawsuitDataUpdateClient.getUpdatedLawsuitData(lawsuitSubscriptionData.id);

			// persists updated lawsuit data on S3
			await this.persistUpdatedLawsuitData(
				input.cnj,
				updatedLawsuitDataAndDocumentsUrl.updatedData
			);

			// checks if lawsuit documents have been found
			const hasDocuments = updatedLawsuitDataAndDocumentsUrl.documentsUrls.find(
				(documentUrl) => !!documentUrl
			)
				? true
				: false;
			if (hasDocuments) {
				// downloads and persists lawsuit documents on S3
				await this.downloadLawsuitDocumentsAndPersist(
					updatedLawsuitDataAndDocumentsUrl.documentsUrls,
					input.cnj
				);

				event.status = EventUpdateLawsuitStatus.FINISHED;
			} else event.status = EventUpdateLawsuitStatus.FINISHED_WITHOUT_DOCUMENTS;

			event.endDate = new Date();
			await this.eventUpdateLawsuitRepository.put(event);
		} catch (error) {
			console.error(`Cannot update data for lawsuit with CNJ ${input.cnj}`, error);
			throw error;
		}
	}

	private async verifyIfLawsuitDataIsAlreadyUpdated(cnj: string): Promise<boolean> {
		const unsyncedLawsuitSubscriptions =
			await this.lawsuitDataUpdateClient.getUnsyncedLawsuitsSubscriptions();

		if (!unsyncedLawsuitSubscriptions || !unsyncedLawsuitSubscriptions.length) return true;

		for (const unsyncedLawsuitSubscription of unsyncedLawsuitSubscriptions) {
			const unsyncedSubscriptionData = await this.lawsuitDataUpdateClient.getLawsuitSubscriptionById(
				unsyncedLawsuitSubscription.id
			);

			const unsyncedLawsuitCnj = unsyncedSubscriptionData.value.replace(/\D/g, '');
			if (unsyncedLawsuitCnj === cnj) return false;
		}

    return true;
	}

	private async persistUpdatedLawsuitData(
		cnj: string,
		updatedLawsuitData: GenericExtractedData[]
	): Promise<void> {
		const hashedLawsuitDataString = this.hashDataAndConvertToString(
			Buffer.from(JSON.stringify(updatedLawsuitData))
		);
		const filePath = path.join(`lawsuits/update/piped`, `${cnj}_${hashedLawsuitDataString}.json`);

		await this.fileManagementClient.uploadFile(
			filePath,
			'application/json',
			Buffer.from(JSON.stringify(updatedLawsuitData))
		);
	}

	private async downloadLawsuitDocumentsAndPersist(
		documentsUrls: string[] | undefined[],
		cnj: string
	): Promise<void> {
		for (const documentUrl of documentsUrls) {
			if (documentUrl) {
				const documentData = await this.fileManagementClient.downloadPdfFile(documentUrl);
				const hashedDocumentDataString = this.hashDataAndConvertToString(documentData);

				const filePath = path.join(
					`lawsuits/documents/piped`,
					`${cnj}_${hashedDocumentDataString}.pdf` // TO DO: necessário agregar nome original do documento na fonte
				);

				await this.fileManagementClient.uploadFile(filePath, 'application/pdf', documentData);
			}
		}
	}

	private hashDataAndConvertToString(data: Buffer): string {
		const hash = createHash('sha256');

		hash.update(data);

		return hash.digest('hex');
	}
}
