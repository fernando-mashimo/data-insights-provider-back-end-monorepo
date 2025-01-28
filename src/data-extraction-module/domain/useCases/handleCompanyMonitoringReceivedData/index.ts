import * as path from 'path';
import { UseCase } from '../UseCase';
import { HandleCompanyMonitoringReceivedDataUseCaseInput } from './input';
import { FileManagementClient } from '../../services/fileManagementClient';
import { EventCompanyMonitoringReceivedDataRepository } from '../../repositories/eventCompanyMonitoringReceivedDataRepository';
import { EventCompanyMonitoringReceivedData } from '../../entities/eventCompanyMonitoringReceivedData';

export class HandleCompanyReceivedDataUseCase
	implements UseCase<HandleCompanyMonitoringReceivedDataUseCaseInput, void>
{
	private fileManagementClient: FileManagementClient;
	private eventCompanyMonitoringReceivedDataRepository: EventCompanyMonitoringReceivedDataRepository;

	constructor(
		fileManagementClient: FileManagementClient,
		eventCompanyMonitoringReceivedDataRepository: EventCompanyMonitoringReceivedDataRepository
	) {
		this.fileManagementClient = fileManagementClient;
		this.eventCompanyMonitoringReceivedDataRepository =
			eventCompanyMonitoringReceivedDataRepository;
	}

	public async execute(input: HandleCompanyMonitoringReceivedDataUseCaseInput): Promise<void> {
		try {
			const filePath = path.join(
				'lawsuits/new-lawsuits/escavador',
				`${input.variationCnpj}_${new Date().toISOString()}.json`
			);
			await this.fileManagementClient.uploadFile(
				filePath,
				'application/json',
				Buffer.from(JSON.stringify(input.receivedData))
			);

			const event = new EventCompanyMonitoringReceivedData(
				input.monitoredCnpj,
				input.variationCnpj,
				input.externalId,
				new Date()
			);
			await this.eventCompanyMonitoringReceivedDataRepository.put(event);
		} catch (error) {
			console.error(
				`Cannot handle data received from company monitoring process for CNPJ ${input.monitoredCnpj}`,
				error
			);
			throw error;
		}
	}
}
