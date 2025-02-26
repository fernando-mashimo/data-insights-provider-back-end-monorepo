import { createHash } from 'node:crypto';
import { EventUpdateComplaintDataRepository } from '../../repositories/eventUpdateComplaintDataRepository';
import { ComplaintsDataExtractorClient } from '../../services/complaintsDataExtractorClient';
import { FileManagementClient } from '../../services/fileManagementClient';
import { UseCase } from '../UseCase';
import { UpdateComplaintDataUseCaseInput } from './input';
import { EventUpdateComplaintData } from '../../entities/eventUpdateComplaintData';
import * as path from 'path';

export class UpdateComplaintDataUseCase implements UseCase<UpdateComplaintDataUseCaseInput, void> {
	private eventUpdateComplaintDataRepository: EventUpdateComplaintDataRepository;
	private complaintsDataExtractorClient: ComplaintsDataExtractorClient;
	private fileManagementClient: FileManagementClient;

	constructor(
		eventUpdateComplaintDataRepository: EventUpdateComplaintDataRepository,
		complaintsDataExtractorClient: ComplaintsDataExtractorClient,
		fileManagementClient: FileManagementClient
	) {
		this.eventUpdateComplaintDataRepository = eventUpdateComplaintDataRepository;
		this.complaintsDataExtractorClient = complaintsDataExtractorClient;
		this.fileManagementClient = fileManagementClient;
	}

	public async execute(input: UpdateComplaintDataUseCaseInput): Promise<void> {
		try {
			console.info('Initiating execution UpdateComplaintData...');

      // retrieve complaint data from external service
			const complaintData = await this.complaintsDataExtractorClient.getComplaintData(
				input.complaintExternalId,
				input.accessToken
			);
			if (!complaintData) {
				console.error(`Complaint with id ${input.complaintExternalId} not found`);
				throw new Error(`Complaint with id ${input.complaintExternalId} not found`);
			}

      // retrieve event update complaint data from repository
			let [eventUpdateComplaintData] =
				await this.eventUpdateComplaintDataRepository.getByComplaintExternalId(
					input.complaintExternalId
				);
			if (!eventUpdateComplaintData) {
				eventUpdateComplaintData = new EventUpdateComplaintData(input.complaintExternalId);
			}

      // check if complaint data has changed since last update
			const complaintHashedString = this.hashDataAndConvertToString(
				Buffer.from(JSON.stringify(complaintData))
			);
			if (
				eventUpdateComplaintData.lastHashedComplaintData &&
				eventUpdateComplaintData.lastHashedComplaintData === complaintHashedString
			) {
				console.info('Complaint data has not changed since last update');
			} else {
				await this.persistData(
					DataType.FULL_DATA,
					input.complaintExternalId,
					complaintData,
					complaintHashedString
				);
        // check if there are new interactions
				const lastInteractionDateRegistered =
					eventUpdateComplaintData.lastInteractionDate ?? undefined;
				if (!lastInteractionDateRegistered) {
					// if no interactions were registered previously (i.e. new complaint), persist all interactions
					const mostRecentInteractionDate = complaintData.interactions.sort(
						(a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
					)[0].created;
					eventUpdateComplaintData.lastInteractionDate = new Date(mostRecentInteractionDate);
					for (const interaction of complaintData.interactions) {
						const interactionHashedString = this.hashDataAndConvertToString(
							Buffer.from(JSON.stringify(interaction))
						);
						await this.persistData(
							DataType.INTERACTIONS,
							input.complaintExternalId,
							interaction,
							interactionHashedString
						);
					}
				} else {
          // if there were interactions registered previously, persist only the new ones
          // if no new interactions are found, nothing is persisted (implicit)
					const newInteractions = complaintData.interactions.filter(
						(interaction) => new Date(interaction.created) > lastInteractionDateRegistered
					);
					for (const interaction of newInteractions) {
						const interactionHashedString = this.hashDataAndConvertToString(
							Buffer.from(JSON.stringify(interaction))
						);
						await this.persistData(
							DataType.INTERACTIONS,
							input.complaintExternalId,
							interaction,
							interactionHashedString
						);
					}
          // update event with the most recent interaction date
					const mostRecentInteraction = newInteractions.sort(
						(a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
					)[0];

					if (mostRecentInteraction)
						eventUpdateComplaintData.lastInteractionDate = new Date(mostRecentInteraction.created);
				}

        eventUpdateComplaintData.lastHashedComplaintData = complaintHashedString;
				eventUpdateComplaintData.lastPersistedAt = new Date();
			}

			eventUpdateComplaintData.lastUpdatedAt = new Date();
			await this.eventUpdateComplaintDataRepository.put(eventUpdateComplaintData);

			console.info('UpdateComplaintData execution finished');
		} catch (error) {
			console.error(
				`Cannot update complaint data for complaint with id ${input.complaintExternalId}`,
				error
			);
			throw error;
		}
	}

	private hashDataAndConvertToString(data: Buffer): string {
		const hash = createHash('sha256');

		hash.update(data);

		return hash.digest('hex');
	}

	private async persistData(
		dataType: DataType,
		complaintExternalId: string,
		data: { [key: string]: string | number | boolean | object | null },
		dataHashedString: string
	): Promise<void> {
		const filePath = path.join(
			`complaints/${dataType}/reclame-aqui`,
			`${complaintExternalId}_${dataHashedString}.json`
		);

		await this.fileManagementClient.uploadFile(
			filePath,
			'application/json',
			Buffer.from(JSON.stringify(data))
		);
	}
}

export enum DataType {
	FULL_DATA = 'full-data',
	INTERACTIONS = 'interactions'
}
