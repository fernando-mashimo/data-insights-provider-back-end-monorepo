import { createHash } from 'node:crypto';
import { EventComplaintsExtractionMetadataRepository } from '../../repositories/eventComplaintsExtractionMetadataRepository';
import {
	ComplaintBasicData,
	ComplaintsDataExtractorClient
} from '../../services/complaintsDataExtractorClient';
import { UseCase } from '../UseCase';
import { UpdateComplaintsListUseCaseInput } from './input';
import * as path from 'path';
import { FileManagementClient } from '../../services/fileManagementClient';
import { handler as updateComplaintDataHandler } from '../../../adapters/input/sqs/updateComplaintData';
import { sqsRecordAttributes } from '../../../adapters/input/sqs/helpers/sqsRecordAttributes';

export class UpdateComplaintsListUseCase
	implements UseCase<UpdateComplaintsListUseCaseInput, void>
{
	private eventComplaintsExtractionMetadataRepository: EventComplaintsExtractionMetadataRepository;
	private complaintsDataExtractorClient: ComplaintsDataExtractorClient;
	private fileManagementClient: FileManagementClient;

	constructor(
		eventComplaintsExtractionMetadataRepository: EventComplaintsExtractionMetadataRepository,
		complaintsDataExtractorClient: ComplaintsDataExtractorClient,
		fileManagementClient: FileManagementClient
	) {
		this.eventComplaintsExtractionMetadataRepository = eventComplaintsExtractionMetadataRepository;
		this.complaintsDataExtractorClient = complaintsDataExtractorClient;
		this.fileManagementClient = fileManagementClient;
	}

	public async execute(input: UpdateComplaintsListUseCaseInput): Promise<void> {
		try {
			console.info('Initiating execution UpdateComplaintsList...');

      // retrieve company metadata from external service
			const companyMetadata = await this.complaintsDataExtractorClient.getCompanyMetadata(
				input.accessToken
			);

      // retrieve event complaints extraction metadata from repository
			const [eventComplaintsExtractionMetadata] =
				await this.eventComplaintsExtractionMetadataRepository.getByCnpj(companyMetadata.cnpj);

      // retrieve complaints list from external service
			const complaints = await this.complaintsDataExtractorClient.getComplaints(
				companyMetadata.companyExternalId,
				input.accessToken
			);

      // check if complaints list has changed since last update
			const complaintsHash = this.hashDataAndConvertToString(
				Buffer.from(JSON.stringify(complaints))
			);

			if (
				eventComplaintsExtractionMetadata.lastComplaintsListHash &&
				eventComplaintsExtractionMetadata.lastComplaintsListHash === complaintsHash
			) {
				console.info('Complaints list has not changed since last update');
			} else {
				await this.persistComplaints(companyMetadata.cnpj, complaints, complaintsHash);
				eventComplaintsExtractionMetadata.lastComplaintsListHash = complaintsHash;
				eventComplaintsExtractionMetadata.lastComplaintsListPersistedAt = new Date();
			}

			eventComplaintsExtractionMetadata.lastUpdatedAt = new Date();
			await this.eventComplaintsExtractionMetadataRepository.put(eventComplaintsExtractionMetadata);

			for (const complaint of complaints) {
        // for each of the complaints found for the company,
        // this use case calls updateComplaintData flow through its lambda function handler
				// to start the complaint data updating process
				// this is a workaround due to not being able to make requests to Reclame Aqui through lambda functions without a proxy - the actual sequence would be to send a message to an SQS queue
				await updateComplaintDataHandler({
          Records: [
            {
              body: JSON.stringify({
                complaintExternalId: complaint.id,
								accessToken: input.accessToken
							}),
							...sqsRecordAttributes
						}
					]
				});
			}
      console.info('UpdateComplaintData flow has been called for each complaint found');

      console.info('UpdateComplaintsList execution finished');
		} catch (error) {
			console.error('Cannot update complaints list', error);
			throw error;
		}
	}

	private hashDataAndConvertToString(data: Buffer): string {
		const hash = createHash('sha256');

		hash.update(data);

		return hash.digest('hex');
	}

	private async persistComplaints(
		cnpj: string,
		complaints: ComplaintBasicData[],
		complaintsHashedString: string
	): Promise<void> {
		const filePath = path.join(
			`complaints/list-per-company/reclame-aqui`,
			`${cnpj}_${complaintsHashedString}.json`
		);

		await this.fileManagementClient.uploadFile(
			filePath,
			'application/json',
			Buffer.from(JSON.stringify(complaints))
		);
	}
}
