import { $config } from '$config';
import {
	EventExtractLawsuitDocumentAsync,
	EventExtractLawsuitDocumentAsyncStatus
} from '../../entities/eventExtractLawsuitDocumentAsync';
import { EventExtractLawsuitDocumentAsyncRepository } from '../../repositories/eventExtractLawsuitDocumentAsyncRepository';
import { LawsuitDataExtractorClient } from '../../services/lawsuitDataExtractorClient';
import { UseCase } from '../UseCase';
import { TriggerExtractLawsuitDocumentAsyncUseCaseInput } from './input';

export class TriggerExtractLawsuitDocumentAsyncUseCase
	implements UseCase<TriggerExtractLawsuitDocumentAsyncUseCaseInput, void>
{
	private eventExtractLawsuitDocumentAsyncRepository: EventExtractLawsuitDocumentAsyncRepository;
	private lawsuitDataExtractorClient: LawsuitDataExtractorClient;

	constructor(
		eventExtractLawsuitDocumentAsyncRepository: EventExtractLawsuitDocumentAsyncRepository,
		lawsuitDataExtractorClient: LawsuitDataExtractorClient
	) {
		this.eventExtractLawsuitDocumentAsyncRepository = eventExtractLawsuitDocumentAsyncRepository;
		this.lawsuitDataExtractorClient = lawsuitDataExtractorClient;
	}

	public async execute(input: TriggerExtractLawsuitDocumentAsyncUseCaseInput): Promise<void> {
		const extractionTimeWindow = new Date(
			new Date().getDate() - $config.ESCAVADOR_DOCUMENT_EXTRACTION_MAX_TIME_WINDOW_DAYS
		);

		try {
			const existingRecentEvents =
				await this.eventExtractLawsuitDocumentAsyncRepository.getByCnjAndLastExtractionDate(
					input.cnj,
					extractionTimeWindow
				);

			if (
				existingRecentEvents.length &&
				existingRecentEvents.every(
					(event: EventExtractLawsuitDocumentAsync) =>
						event.status === EventExtractLawsuitDocumentAsyncStatus.FINISHED
				)
			) {
				console.info(`Lawsuit document for CNJ ${input.cnj} recently extracted`);
				return;
			}

			const createdAsyncProcess =
				await this.lawsuitDataExtractorClient.createLawsuitDocumentExtractionAsyncProcess(
					input.cnj,
					input.courtState
				);

			const event = new EventExtractLawsuitDocumentAsync(
				input.cnj,
				createdAsyncProcess.id,
				EventExtractLawsuitDocumentAsyncStatus.PENDING,
				new Date()
			);

			await this.eventExtractLawsuitDocumentAsyncRepository.put(event);
		} catch (error) {
			console.error(`Cannot asynchronously extract lawsuit document for CNJ ${input.cnj}`);
			throw error;
		}
	}
}
