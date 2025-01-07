import { $config } from '$config';
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
		const namesToExtract = await this.filterNamesWithoutRecentExtraction(nameVariations);

		if (!namesToExtract.length) {
			console.info(
				`No new extractions needed for ${fullName} - last extraction executed less than ${$config.LINKEDIN_EXTRACTION_MAX_TIME_WINDOW_DAYS} days ago`
			);
			return;
		}

		const promises = namesToExtract.map(async (name) => {
			const snapshotId = await this.linkedinExtractorClient.triggerProfileExtractByName([name]);

			const extractionEvent = new EventExtractLinkedin(
				fullName,
				name.firstName,
				name.lastName,
				snapshotId
			);
			await this.repository.put(extractionEvent);
		});

		await Promise.all(promises);
	}

	private async filterNamesWithoutRecentExtraction(
		names: { firstName: string; lastName: string }[]
	): Promise<{ firstName: string; lastName: string }[]> {
		const filteredNames = [];

		for (const name of names) {
			const extractionTimeWindow = new Date(
				new Date().getDate() - $config.LINKEDIN_EXTRACTION_MAX_TIME_WINDOW_DAYS
			); // If the last extraction was executed more than N days ago, a new extraction will be triggered now
			const event = await this.repository.getByNameAndLastExtractionDate(
				name.firstName,
				name.lastName,
				extractionTimeWindow
			);

			if (!event || !event.length) {
				filteredNames.push(name);
			}
		}

		return filteredNames;
	}
}
