import { $config } from '$config';
import * as path from 'path';
import { EventExtractLawsuitTimeline, EventExtractLawsuitTimelineStatus } from '../../entities/eventExtractLawsuitTimeline';
import { EventExtractLawsuitTimelineRepository } from '../../repositories/eventExtractLawsuitTimelineRepository';
import { FileManagementClient } from '../../services/fileManagementClient';
import { GenericExtractedData, LawsuitTimelineDataExtractionResponse, LawsuitTimelineDataExtractorClient } from '../../services/lawsuitTimelineDataExtractorClient';
import { UseCase } from '../UseCase';
import { ExtractLawsuitTimelineDataUseCaseInput } from './input';

export class ExtractLawsuitTimelineDataUseCase
	implements UseCase<ExtractLawsuitTimelineDataUseCaseInput, void>
{
	private lawsuitTimelineDataExtractorClient: LawsuitTimelineDataExtractorClient;
	private fileManagementClient: FileManagementClient;
	private eventExtractLawsuitTimelineRepository: EventExtractLawsuitTimelineRepository;

	constructor(
		lawsuitTimelineDataExtractorClient: LawsuitTimelineDataExtractorClient,
		fileManagementClient: FileManagementClient,
		eventExtractLawsuitTimelineRepository: EventExtractLawsuitTimelineRepository
	) {
		this.lawsuitTimelineDataExtractorClient = lawsuitTimelineDataExtractorClient;
		this.fileManagementClient = fileManagementClient;
		this.eventExtractLawsuitTimelineRepository = eventExtractLawsuitTimelineRepository;
	}

	public async execute(input: ExtractLawsuitTimelineDataUseCaseInput): Promise<void> {
		const extractionTimeWindow = new Date(
			new Date().getDate() - $config.ESCAVADOR_EXTRACTION_MAX_TIME_WINDOW_DAYS
		);

		try {
			const existingEvents =
				await this.eventExtractLawsuitTimelineRepository.getByCnjAndLastExtractionDate(
					input.cnj,
					extractionTimeWindow
				);

			if (!existingEvents || !existingEvents.length) {
				const event = new EventExtractLawsuitTimeline(
					input.cnj,
					EventExtractLawsuitTimelineStatus.PENDING,
					new Date()
				);
				await this.eventExtractLawsuitTimelineRepository.put(event);

				await this.getTimelineDataAndPersist(input.cnj, event, 1, null);

				return;
			}

			const recentlyFinishedEvents = existingEvents.filter(
				(event) => event.status === EventExtractLawsuitTimelineStatus.FINISHED
			);
			if (recentlyFinishedEvents.length) {
				console.info(`Timeline data for lawsuit with CNJ ${input.cnj} recently extracted`);
				return;
			}

			if (!recentlyFinishedEvents.length) {
				const event = existingEvents[0];
				const page = event.pagesDownloaded ? event.pagesDownloaded + 1 : 1;
				const nextPageUrl = event.nextPageUrl ?? null;

				await this.getTimelineDataAndPersist(input.cnj, event, page, nextPageUrl);

				return;
			}
		} catch (error) {
			console.error(`Error extracting lawsuit timeline data for CNJ ${input.cnj}`, error);
			throw error;
		}
	}

	private async getTimelineDataAndPersist(
		cnj: string,
		event: EventExtractLawsuitTimeline,
		startPage: number,
		startNextPageUrl: string | null
	): Promise<void> {
		let hasNextPage: boolean = true;
		let page: number = startPage;
		let nextPageUrl: string | null = startNextPageUrl;

		while (hasNextPage) {
			const timelineData: LawsuitTimelineDataExtractionResponse =
				await this.lawsuitTimelineDataExtractorClient.getLawsuitTimeline(cnj, nextPageUrl);

			await this.persistTimelineData(cnj, timelineData.timeline);

			event.pagesDownloaded = page;
			event.nextPageUrl = timelineData.nextPageUrl;
			await this.eventExtractLawsuitTimelineRepository.put(event);

			if (!timelineData.hasNext) hasNextPage = false;
			else {
				nextPageUrl = timelineData.nextPageUrl;
				page += 1;
			}
		}

		event.status = EventExtractLawsuitTimelineStatus.FINISHED;
		event.endDate = new Date();
		await this.eventExtractLawsuitTimelineRepository.put(event);
	}

	private async persistTimelineData(
		cnj: string,
		timelineData: GenericExtractedData[]
	): Promise<void> {
		const filePath = path.join(
			`lawsuits/timelines/escavador`,
			`${cnj}_${new Date().toISOString()}.json`
		);

		await this.fileManagementClient.uploadFile(
			filePath,
			'application/json',
			Buffer.from(JSON.stringify(timelineData))
		);
	}
}
