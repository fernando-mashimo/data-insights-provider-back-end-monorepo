import { EventComplaintsExtractionMetadata } from '../../entities/eventComplaintsExtractionMetadata';
import { EventComplaintsExtractionMetadataRepository } from '../../repositories/eventComplaintsExtractionMetadataRepository';
import { ComplaintsDataExtractorClient } from '../../services/complaintsDataExtractorClient';
import { UseCase } from '../UseCase';
import { CreateComplaintsExtractionMetadataUseCaseInput } from './input';
import { handler as updateComplaintsListHandler } from '../../../adapters/input/sqs/updateComplaintsList';
import { sqsRecordAttributes } from '../../../adapters/input/sqs/helpers/sqsRecordAttributes';

export class CreateComplaintsExtractionMetadataUseCase
	implements UseCase<CreateComplaintsExtractionMetadataUseCaseInput, void>
{
	private eventComplaintsExtractionMetadataRepository: EventComplaintsExtractionMetadataRepository;
	private complaintsDataExtractorClient: ComplaintsDataExtractorClient;

	constructor(
		eventComplaintsExtractionMetadataRepository: EventComplaintsExtractionMetadataRepository,
		complaintsDataExtractorClient: ComplaintsDataExtractorClient
	) {
		this.eventComplaintsExtractionMetadataRepository = eventComplaintsExtractionMetadataRepository;
		this.complaintsDataExtractorClient = complaintsDataExtractorClient;
	}

	public async execute(input: CreateComplaintsExtractionMetadataUseCaseInput): Promise<void> {
		console.info('Initiating execution CreateComplaintsExtractionMetadata...');
		let event: EventComplaintsExtractionMetadata;
		try {
			const complaintsExtractorAccessToken =
				await this.complaintsDataExtractorClient.getAccessToken(input.refreshToken);

			const companyMetadata = await this.complaintsDataExtractorClient.getCompanyMetadata(
				complaintsExtractorAccessToken
			);

			const existingEventComplaintsExtractionMetadata =
				await this.eventComplaintsExtractionMetadataRepository.getByCnpj(companyMetadata.cnpj);

			if (existingEventComplaintsExtractionMetadata.length) {
				console.info('Existing complaint metadata event found. It will be updated.');
				event = existingEventComplaintsExtractionMetadata[0];
				event.lastUpdatedAt = new Date();
			} else {
				console.info('No existing complaint metadata event found. Creating new one.');
				event = new EventComplaintsExtractionMetadata(
					companyMetadata.cnpj,
					companyMetadata.companyName,
					companyMetadata.companyExternalId,
					new Date()
				);
			}

			await this.eventComplaintsExtractionMetadataRepository.put(event);

			// calls updateComplaintsList flow through its lambda function handler
      // to start the complaints list extraction process
      // this is a workaround due to not being able to make requests to Reclame Aqui through lambda functions without a proxy - the actual sequence would be to send a message to an SQS queue
			await updateComplaintsListHandler({
				Records: [
					{
						body: JSON.stringify({
							accessToken: complaintsExtractorAccessToken
						}),
						...sqsRecordAttributes
					}
				]
			});

			console.info('CreateComplaintsExtractionMetadata execution finished');
		} catch (error) {
			console.error('Cannot create complaints extraction metadata', error);
			throw error;
		}
	}
}
