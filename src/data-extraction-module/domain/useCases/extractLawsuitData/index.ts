import { $config } from '$config';
import * as path from 'path';
import { FileManagementClient } from '../../services/fileManagementClient';
import {
	GenericExtractedData,
	LawsuitDataExtractionResponse,
	LawsuitDataExtractorClient
} from '../../services/lawsuitDataExtractorClient';
import { UseCase } from '../UseCase';
import { ExtractLawsuitDataUseCaseInput as ExtractLawsuitDataUseCaseInput } from './input';
import { EventExtractLawsuitRepository } from '../../repositories/eventExtractLawsuitRepository';
import {
	EventExtractLawsuits,
	EventExtractLawsuitsStatus
} from '../../entities/eventExtractLawsuits';
import { LawsuitsTimelineDataExtractionQueue } from '../../queues/lawsuitTimelineDataExtractionQueue';

/**
 * Use case to extract lawsuit data from external source (currently Escavador API)
 *
 * The use case is responsible for:
 * - Extracting lawsuit data from Escavador API
 * - Persisting lawsuit data on S3
 * - Sending messages to SQS queues for further processing
 *    - Creating lawsuit timeline data extraction messages
 *      - The lawsuit timeline data extraction messages will trigger the extraction of lawsuit timeline data
 *    - Creating lawsuit data update messages
 *      - The lawsuit data update messages will trigger the update of lawsuit data
 * - Updating event status on EventExtractLawsuitRepository
 *
 */
export class ExtractLawsuitDataUseCase implements UseCase<ExtractLawsuitDataUseCaseInput, void> {
	private lawsuitDataExtractorClient: LawsuitDataExtractorClient;
	private fileManagementClient: FileManagementClient;
	private eventExtractLawsuitRepository: EventExtractLawsuitRepository;
	private lawsuitsTimelineDataExtractionQueue: LawsuitsTimelineDataExtractionQueue;

	constructor(
		lawsuitDataExtractorClient: LawsuitDataExtractorClient,
		fileManagementClient: FileManagementClient,
		eventExtractLawsuitRepository: EventExtractLawsuitRepository,
		lawsuitsTimelineDataExtractionQueue: LawsuitsTimelineDataExtractionQueue,
	) {
		this.lawsuitDataExtractorClient = lawsuitDataExtractorClient;
		this.fileManagementClient = fileManagementClient;
		this.eventExtractLawsuitRepository = eventExtractLawsuitRepository;
		this.lawsuitsTimelineDataExtractionQueue = lawsuitsTimelineDataExtractionQueue;
	}

	public async execute(input: ExtractLawsuitDataUseCaseInput): Promise<void> {
		const cleanCnpj = input.cnpj.replace(/\D/g, '');
		const extractionTimeWindow = new Date(
			new Date().getDate() - $config.ESCAVADOR_EXTRACTION_MAX_TIME_WINDOW_DAYS
		);

		try {
			const existingEvents =
				await this.eventExtractLawsuitRepository.getByCnpjAndLastExtractionDate(
					cleanCnpj,
					extractionTimeWindow
				);

			if (!existingEvents || !existingEvents.length) {
				const event = new EventExtractLawsuits(
					input.cnpj,
					cleanCnpj,
					EventExtractLawsuitsStatus.PENDING,
					new Date()
				);
				await this.eventExtractLawsuitRepository.put(event);

				await this.getLawsuitsDataAndPersist(cleanCnpj, event, 1, null);

				return;
			}

			// Recent extraction events were found
			// If the most recent event is already finished, there is no need to extract data again
			const recentlyFinishedEvents = existingEvents.filter(
				(event) => event.status === EventExtractLawsuitsStatus.FINISHED
			);
			if (recentlyFinishedEvents.length) {
				console.info(`Lawsuits data for CNPJ ${cleanCnpj} recently extracted`);
				return;
			}

			// If the most recent event is still pending, we need to continue the extraction from where it stopped
			if (!recentlyFinishedEvents.length) {
				const event = existingEvents[0];
				const page = event.pagesDownloaded ? event.pagesDownloaded + 1 : 1;
				const nextPageUrl = event.nextPageUrl ?? null;

				await this.getLawsuitsDataAndPersist(cleanCnpj, event, page, nextPageUrl);

				return;
			}
		} catch (error) {
			console.error(`Error extracting lawsuits data for CNPJ ${cleanCnpj}`);
			throw error;
		}
	}

	private async getLawsuitsDataAndPersist(
		cleanCnpj: string,
		event: EventExtractLawsuits,
		startPage: number,
		startNextPageUrl: string | null
	): Promise<void> {
		let hasNextPage: boolean = true;
		let page: number = startPage;
		let nextPageUrl: string | null = startNextPageUrl;

		while (hasNextPage) {
			const lawsuitsData: LawsuitDataExtractionResponse =
				await this.lawsuitDataExtractorClient.getLawsuits(cleanCnpj, nextPageUrl);

			await this.persistLawsuitsData(cleanCnpj, lawsuitsData.lawsuits);

			event.totalPages = lawsuitsData.totalPages;
			event.pagesDownloaded = page;
			event.nextPageUrl = lawsuitsData.nextPageUrl;
			await this.eventExtractLawsuitRepository.put(event);

			if (!lawsuitsData.hasNext) hasNextPage = false;
			else {
				nextPageUrl = lawsuitsData.nextPageUrl;
				page += 1;
			}

			// Send messages to lawsuits' timeline extraction
			await this.lawsuitsTimelineDataExtractionQueue.sendExtractDataMessages({
				lawsuits: lawsuitsData.lawsuits
			});
		}

		event.status = EventExtractLawsuitsStatus.FINISHED;
		event.endDate = new Date();
		await this.eventExtractLawsuitRepository.put(event);
	}

	private async persistLawsuitsData(
		cnpj: string,
		lawsuitsData: GenericExtractedData[]
	): Promise<void> {
		const filePath = path.join(
			`lawsuits/main/escavador`,
			`${cnpj}_${new Date().toISOString()}.json`
		);

		await this.fileManagementClient.uploadFile(
			filePath,
			'application/json',
			Buffer.from(JSON.stringify(lawsuitsData))
		);
	}
}
