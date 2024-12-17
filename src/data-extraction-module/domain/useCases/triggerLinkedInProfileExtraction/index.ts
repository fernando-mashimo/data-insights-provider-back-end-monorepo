import { EventExtractLinkedin } from '../../entities/eventExtractLinkedin';
import { EventExtractLinkedinRepository } from '../../repositories/eventExtractLinkedinRepository';
import { LinkedinExtractorClient } from '../../services/linkedinExtractorClient';
import { UseCase } from '../UseCase';
import { clearName, getNameVariations } from './helper';
import { TriggerLinkedInProfileExtractionUseCaseInput } from './input';

export class TriggerLinkedInProfileExtractionUseCase
	implements UseCase<TriggerLinkedInProfileExtractionUseCaseInput, void>
{
	constructor(
		private linkedinExtractorClient: LinkedinExtractorClient,
		private repository: EventExtractLinkedinRepository
	) {}

	public async execute(input: TriggerLinkedInProfileExtractionUseCaseInput): Promise<void> {
		const fullName = input.name;
		const cleanedName = clearName(fullName);
		const nameVariations = getNameVariations(cleanedName);

		const promises = nameVariations.map(async (nameVariation) => {
			const snapshotId = await this.linkedinExtractorClient.triggerProfileExtractByName([
				nameVariation
			]);

			const extractionEvent = new EventExtractLinkedin(
				fullName,
				nameVariation.firstName,
				nameVariation.lastName,
				snapshotId
			);
			await this.repository.put(extractionEvent);
		});

		await Promise.all(promises);
	}
}
