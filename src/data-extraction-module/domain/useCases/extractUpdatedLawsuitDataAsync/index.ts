import { EventUpdateLawsuitAsyncRepository } from '../../repositories/eventUpdateLawsuitAsyncRepository';
import { FileManagementClient } from '../../services/fileManagementClient';
import { LawsuitDataExtractorClient } from '../../services/lawsuitDataExtractorClient';
import { UseCase } from '../UseCase';
import { ExtractUpdatedLawsuitDataAsyncUseCaseInput } from './input';
import * as path from 'path';
import { createHash } from 'node:crypto';
import {
	LawsuitTimelineDataExtractionResponse,
	LawsuitTimelineDataExtractorClient
} from '../../services/lawsuitTimelineDataExtractorClient';
import { EventUpdateLawsuitAsyncStatus } from '../../entities/eventUpdateLawsuitAsync';

export class ExtractUpdatedLawsuitDataAsyncUseCase
	implements UseCase<ExtractUpdatedLawsuitDataAsyncUseCaseInput, void>
{
	private eventUpdateLawsuitAsyncRepository: EventUpdateLawsuitAsyncRepository;
	private lawsuitDataExtractorClient: LawsuitDataExtractorClient;
	private lawsuitTimelineDataExtractorClient: LawsuitTimelineDataExtractorClient;
	private fileManagementClient: FileManagementClient;

	constructor(
		eventUpdateLawsuitAsyncRepository: EventUpdateLawsuitAsyncRepository,
		lawsuitDataExtractorClient: LawsuitDataExtractorClient,
		lawsuitTimelineDataExtractorClient: LawsuitTimelineDataExtractorClient,
		fileManagementClient: FileManagementClient
	) {
		this.eventUpdateLawsuitAsyncRepository = eventUpdateLawsuitAsyncRepository;
		this.lawsuitDataExtractorClient = lawsuitDataExtractorClient;
		this.lawsuitTimelineDataExtractorClient = lawsuitTimelineDataExtractorClient;
		this.fileManagementClient = fileManagementClient;
	}

	public async execute(input: ExtractUpdatedLawsuitDataAsyncUseCaseInput): Promise<void> {
		try {
			const event = await this.eventUpdateLawsuitAsyncRepository.getByCnjAndExternalId(
				input.cnj,
				input.asyncProcessExternalId
			);

			const lawsuitData = await this.lawsuitDataExtractorClient.getLawsuitDataByCnj(input.cnj);
			await this.persistData(DataType.MAIN_DATA, input.cnj, lawsuitData);

			await this.getTimelineDataAndPersist(input.cnj);

			event.status = EventUpdateLawsuitAsyncStatus.FINISHED;
			event.endDate = new Date();
			await this.eventUpdateLawsuitAsyncRepository.put(event);
		} catch (error) {
			console.error(
				`Cannot extract asynchronously updated lawsuit data with CNJ ${input.cnj} and external id ${input.asyncProcessExternalId}`,
				error
			);
			throw error;
		}
	}

	private async getTimelineDataAndPersist(cnj: string): Promise<void> {
		let hasNextPage: boolean = true;
		let nextPageUrl = null;

		while (hasNextPage) {
			const timelineData: LawsuitTimelineDataExtractionResponse =
				await this.lawsuitTimelineDataExtractorClient.getLawsuitTimeline(cnj, nextPageUrl);

			await this.persistData(DataType.TIMELINE, cnj, timelineData.timeline);

			if (!timelineData.hasNext) hasNextPage = false;
			else nextPageUrl = timelineData.nextPageUrl;
		}
	}

	private async persistData(
		dataType: DataType,
		cnj: string,
		data: GenericExtractedData | GenericExtractedData[]
	): Promise<void> {
		const hashedLawsuitDataString = this.hashDataAndConvertToString(
			Buffer.from(JSON.stringify(data))
		);
		const filePath = path.join(
			`lawsuits/update/escavador/`,
			`${cnj}_${dataType}_${hashedLawsuitDataString}.json`
		);

		await this.fileManagementClient.uploadFile(
			filePath,
			'application/json',
			Buffer.from(JSON.stringify(data))
		);
	}

	private hashDataAndConvertToString(data: Buffer): string {
		const hash = createHash('sha256');

		hash.update(data);

		return hash.digest('hex');
	}
}

enum DataType {
	MAIN_DATA = 'main',
	TIMELINE = 'timeline'
}

type GenericExtractedData = {
	[key: string]: string | number | boolean | object | null;
};
