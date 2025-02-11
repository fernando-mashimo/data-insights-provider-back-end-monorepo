import { $config } from '$config';
import {
	EventUpdateLawsuitAsync,
	EventUpdateLawsuitAsyncStatus
} from '../../entities/eventUpdateLawsuitAsync';
import { EventUpdateLawsuitAsyncRepository } from '../../repositories/eventUpdateLawsuitAsyncRepository';
import { LawsuitDataExtractorClient } from '../../services/lawsuitDataExtractorClient';
import { UseCase } from '../UseCase';
import { UpdateLawsuitDataAsyncUseCaseInput } from './input';

export class UpdateLawsuitDataAsyncUseCase
	implements UseCase<UpdateLawsuitDataAsyncUseCaseInput, void>
{
	private lawsuitDataExtractorClient: LawsuitDataExtractorClient;
	private eventUpdateLawsuitAsyncRepository: EventUpdateLawsuitAsyncRepository;

	constructor(
		lawsuitDataExtractorClient: LawsuitDataExtractorClient,
		eventUpdateLawsuitAsyncRepository: EventUpdateLawsuitAsyncRepository
	) {
		this.lawsuitDataExtractorClient = lawsuitDataExtractorClient;
		this.eventUpdateLawsuitAsyncRepository = eventUpdateLawsuitAsyncRepository;
	}

	public async execute(input: UpdateLawsuitDataAsyncUseCaseInput): Promise<void> {
    const cleanCnj = input.cnj.replace(/\D/g, '');
		const lastUpdateDate = new Date(
			new Date().getDate() - $config.ESCAVADOR_ASYNC_UPDATE_MAX_TIME_WINDOW_DAYS
		);

		try {
			const existingRecentEvents =
				await this.eventUpdateLawsuitAsyncRepository.getByCnjAndLastUpdateDate(
					cleanCnj,
					lastUpdateDate
				);

			if (
				existingRecentEvents.length &&
				existingRecentEvents.every(
					(event: EventUpdateLawsuitAsync) =>
						event.status === EventUpdateLawsuitAsyncStatus.FINISHED
				)
			) {
				console.info(`Data for CNJ ${input.cnj} recently updated`);
				return;
			}

			const newAsyncLawsuitUpdateProcess =
				await this.lawsuitDataExtractorClient.createLawsuitUpdateAsyncProcess(cleanCnj);

			const event = new EventUpdateLawsuitAsync(cleanCnj, newAsyncLawsuitUpdateProcess.id);
			await this.eventUpdateLawsuitAsyncRepository.put(event);
		} catch (error) {
			console.error(`Cannot asynchronously update lawsuit data for CNJ ${input.cnj}`);
			throw error;
		}
	}
}
