import { EventComplaintsExtractionMetadata } from '../../entities/eventComplaintsExtractionMetadata';
import { EventComplaintsExtractionMetadataRepository } from '../../repositories/eventComplaintsExtractionMetadataRepository';
import { ComplaintsDataExtractorClient } from '../../services/complaintsDataExtractorClient';
import { UseCase } from '../UseCase';
import { CreateComplaintsExtractionMetadataUseCaseInput } from './input';
import { UpdateComplaintsListUseCase } from '../updateComplaintsList';

export class CreateComplaintsExtractionMetadataUseCase
	implements UseCase<CreateComplaintsExtractionMetadataUseCaseInput, void>
{
	private eventComplaintsExtractionMetadataRepository: EventComplaintsExtractionMetadataRepository;
	private complaintsDataExtractorClient: ComplaintsDataExtractorClient;
  private updateComplaintsListUsecase: UpdateComplaintsListUseCase;

	constructor(
		eventComplaintsExtractionMetadataRepository: EventComplaintsExtractionMetadataRepository,
		complaintsDataExtractorClient: ComplaintsDataExtractorClient,
    updateComplaintsListUsecase: UpdateComplaintsListUseCase
	) {
		this.eventComplaintsExtractionMetadataRepository = eventComplaintsExtractionMetadataRepository;
		this.complaintsDataExtractorClient = complaintsDataExtractorClient;
    this.updateComplaintsListUsecase = updateComplaintsListUsecase;
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

			// calls updateComplaintsList flow use case
      // to start the complaints list extraction process
      // this is a workaround due to not being able to make requests to Reclame Aqui through lambda functions without a proxy - the actual sequence would be to send a message to an SQS queue
			await this.updateComplaintsListUsecase.execute({
        accessToken: complaintsExtractorAccessToken,
      });

			console.info('CreateComplaintsExtractionMetadata execution finished');
		} catch (error) {
			console.error('Cannot create complaints extraction metadata', error);
			throw error;
		}
	}
}
