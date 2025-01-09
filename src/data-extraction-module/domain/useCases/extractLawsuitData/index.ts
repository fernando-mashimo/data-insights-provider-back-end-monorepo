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

export class ExtractLawsuitDataUseCase implements UseCase<ExtractLawsuitDataUseCaseInput, void> {
	private lawsuitDataExtractorClient: LawsuitDataExtractorClient;
	private fileManagementClient: FileManagementClient;
	private eventExtractLawsuitRepository: EventExtractLawsuitRepository;

	constructor(
		lawsuitDataExtractorClient: LawsuitDataExtractorClient,
		fileManagementClient: FileManagementClient,
		eventExtractLawsuitRepository: EventExtractLawsuitRepository
	) {
		this.lawsuitDataExtractorClient = lawsuitDataExtractorClient;
		this.fileManagementClient = fileManagementClient;
		this.eventExtractLawsuitRepository = eventExtractLawsuitRepository;
	}

	public async execute(input: ExtractLawsuitDataUseCaseInput): Promise<void> {
		const cleanCnpj = input.cnpj.replace(/\D/g, '');
		const extractionTimeWindow = new Date(
			new Date().getDate() - $config.ESCAVADOR_EXTRACTION_MAX_TIME_WINDOW_DAYS
		);

		const existingEvents = await this.eventExtractLawsuitRepository.getByCnpjAndLastExtractionDate(
			cleanCnpj,
			extractionTimeWindow
		);

		// se retornar algo, verificar a "situação da consulta" e fazer o tratamento adequado

		// se retornar vazio, fazer nova consulta
		if (!existingEvents || !existingEvents.length) {
			let hasNextPage: boolean = true;
			let page: number = 1;
			let nextPageUrl: string | null = null;

			while (hasNextPage) {
				const lawsuitsData: LawsuitDataExtractionResponse =
					await this.lawsuitDataExtractorClient.getLawsuits(cleanCnpj, nextPageUrl);

				await this.persistLawsuitsData(cleanCnpj, 'main', lawsuitsData.lawsuits);

				const event = new EventExtractLawsuits(
					input.cnpj,
					cleanCnpj,
					lawsuitsData.totalPages > page
						? EventExtractLawsuitsStatus.PENDING
						: EventExtractLawsuitsStatus.FINISHED,
					new Date()
				);
				event.endDate =
					event.status === EventExtractLawsuitsStatus.FINISHED ? new Date() : undefined;
				event.totalPages = lawsuitsData.totalPages;
				event.pagesDownloaded = page;
        event.nextPageUrl = lawsuitsData.nextPageUrl;
				await this.eventExtractLawsuitRepository.put(event);

				// TO DO: segregar para fila
				// // fazer consulta por timelines para cada processo
				// // persistir os dados no S3 - nome arquivo: "cnpj_${timestamp}.json" - pasta timeline
				// for (const lawsuit of lawsuitsData.lawsuits) {
				// 	let timelineHasNextPage: boolean = true;
				// 	let timelinePage: number = 1;
				// 	let timelineNextPageUrl: string | null = null;

				// 	while (timelineHasNextPage) {
				// 		const lawsuitTimelineData = await this.lawsuitDataExtractorClient.getLawsuitTimeline(
				// 			lawsuit,
				// 			timelineNextPageUrl
				// 		);

				// 		await this.persistLawsuitsData(cleanCnpj, 'timeline', lawsuitTimelineData.timeline);

				// 		if (!lawsuitTimelineData.hasNext) timelineHasNextPage = false;
				// 		else timelineNextPageUrl = lawsuitTimelineData.nextPageUrl;
				// 		timelinePage += 1;
				// 	}
				// }

				if (!lawsuitsData.hasNext) hasNextPage = false;
				else nextPageUrl = lawsuitsData.nextPageUrl;
				page += 1;
			}
		}
	}

	private async persistLawsuitsData(
		cnpj: string,
		dataType: 'main' | 'timeline',
		lawsuitsData: GenericExtractedData[]
	): Promise<void> {
		const filePath = path.join(
			`lawsuits/${dataType}/escavador`,
			`${cnpj}_${new Date().toISOString()}.json`
		);

		await this.fileManagementClient.uploadFile(
			filePath,
			'application/json',
			Buffer.from(JSON.stringify(lawsuitsData))
		);
	}
}
