import { EventExtractLinkedinStatus } from '../../entities/eventExtractLinkedin';
import { EventExtractLinkedinRepository } from '../../repositories/eventExtractLinkedinRepository';
import { FileManagementClient } from '../../services/fileManagementClient';
import {
	GenericDataSetExtractionResponse,
	LinkedinExtractorClient
} from '../../services/linkedinExtractorClient';
import { UseCase } from '../UseCase';
import { DownloadLinkedinProfileUseCaseInput } from './input';
import * as path from 'path';

export class DownloadLinkedinProfileUseCase
	implements UseCase<DownloadLinkedinProfileUseCaseInput, void>
{
	constructor(
		private linkedInProfileExtractionClient: LinkedinExtractorClient,
		private repository: EventExtractLinkedinRepository,
		private fileManagementClient: FileManagementClient
	) {}

	public async execute(input: DownloadLinkedinProfileUseCaseInput): Promise<void> {
		const eventData = await this.repository.getById(input.snapshotId);

		if (!eventData)
			throw new Error(`Linkedin extraction Event with snapshotId ${input.snapshotId} not found`);

		if (input.extractionStatus === EventExtractLinkedinStatus.ERROR) {
			eventData.status = EventExtractLinkedinStatus.ERROR;
			eventData.errorMsg = input.error;
			eventData.endDate = new Date();
			await this.repository.put(eventData);
			return;
		}

		let profileData: GenericDataSetExtractionResponse;

		try {
			profileData = await this.linkedInProfileExtractionClient.getExtractedProfile(
				input.snapshotId
			);
		} catch (error) {
			eventData.status = EventExtractLinkedinStatus.ERROR;
			eventData.errorMsg = (error as Error).message;
			eventData.endDate = new Date();
			await this.repository.put(eventData);
			return;
		}

		if (!Array.isArray(profileData)) {
			eventData.status = EventExtractLinkedinStatus.ERROR;
			eventData.errorMsg = 'Invalid profile data. Expected an array';
			eventData.endDate = new Date();
			await this.repository.put(eventData);
			return;
		}

		const snapshotId = input.snapshotId;
		const filePath = path.join('linkedin/profile/brightdata', `${snapshotId}.json`);
		await this.fileManagementClient.uploadFile(
			filePath,
			'application/json',
			Buffer.from(JSON.stringify(profileData))
		);

		eventData.status = EventExtractLinkedinStatus.FINISHED;
		eventData.endDate = new Date();
		eventData.numberOfProfilesFounded = profileData.length;

		await this.repository.put(eventData);
	}
}
