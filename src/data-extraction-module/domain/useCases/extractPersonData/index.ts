import { $config } from '$config';
import {
	EventExtractPersonData,
	EventExtractPersonDataStatus
} from '../../entities/eventExtractPersonData';
import { UseCase } from '../UseCase';
import { ExtractPersonDataUseCaseInput } from './input';
import * as path from 'path';
import { createHash } from 'node:crypto';
import { FileManagementClient } from '../../services/fileManagementClient';
import {
	GenericExtractedData,
	PersonDataExtractorClient
} from '../../services/personDataExtractorClient';
import { EventExtractPersonDataRepository } from '../../repositories/eventExtractPersonDataRepository';

export class ExtractPersonDataUseCase implements UseCase<ExtractPersonDataUseCaseInput, void> {
	private eventExtractPersonDataRepository: EventExtractPersonDataRepository;
	private personDataExtractorClient: PersonDataExtractorClient;
	private fileManagementClient: FileManagementClient;

	constructor(
		eventExtractPersonDataRepository: EventExtractPersonDataRepository,
		personDataExtractorClient: PersonDataExtractorClient,
		fileManagementClient: FileManagementClient
	) {
		this.eventExtractPersonDataRepository = eventExtractPersonDataRepository;
		this.personDataExtractorClient = personDataExtractorClient;
		this.fileManagementClient = fileManagementClient;
	}

	public async execute(input: ExtractPersonDataUseCaseInput): Promise<void> {
		const cleanCpf = input.cpf.replace(/\D/g, '');
		const lastExtractionDate = new Date(
			new Date().getDate() - $config.BIG_DATA_CORP_EXTRACTION_MAX_TIME_WINDOW_DAYS
		);

		try {
			const existingPersonDataExtractionEvents =
				await this.eventExtractPersonDataRepository.getByCpfAndLastExtractionDate(
					cleanCpf,
					lastExtractionDate
				);

			if (
				existingPersonDataExtractionEvents.length &&
				existingPersonDataExtractionEvents.every(
					(event: EventExtractPersonData) => event.status === EventExtractPersonDataStatus.FINISHED
				)
			) {
				console.info(`Data for CPF ${input.cpf} recently extracted`);
				return;
			}

			const event = new EventExtractPersonData(cleanCpf);

			const [basicData, financialData, lawsuitsData] = await Promise.all([
				this.personDataExtractorClient.getBasicData(cleanCpf),
				this.personDataExtractorClient.getFinancialData(cleanCpf),
				this.personDataExtractorClient.getLawsuitsData(cleanCpf)
			]);

			await Promise.all([
				this.persistPersonData(PersonDataType.BASIC, cleanCpf, basicData),
				this.persistPersonData(PersonDataType.FINANCIAL, cleanCpf, financialData),
				this.persistPersonData(PersonDataType.LAWSUITS, cleanCpf, lawsuitsData)
			]);

			event.endDate = new Date();
			event.status = EventExtractPersonDataStatus.FINISHED;
			await this.eventExtractPersonDataRepository.put(event);
		} catch (error) {
			console.error(`Cannot extract person data for CPF ${input.cpf}`, error);
			throw error;
		}
	}

	private async persistPersonData(
		type: PersonDataType,
		cpf: string,
		data: GenericExtractedData
	): Promise<void> {
		const hashedDataString = this.hashDataAndConvertToString(Buffer.from(JSON.stringify(data)));
		const filePath = path.join(`persons/${type}/big-data-corp`, `${cpf}_${hashedDataString}.json`);

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

enum PersonDataType {
	BASIC = 'basic',
	FINANCIAL = 'financial',
	LAWSUITS = 'lawsuits'
}
