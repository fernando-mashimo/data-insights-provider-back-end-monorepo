import { EventCompanyMonitoring } from '../../entities/eventCompanyMonitoring';
import { EventCompanyMonitoringRepository } from '../../repositories/eventCompanyMonitoringRepository';
import { LawsuitDataExtractorClient } from '../../services/lawsuitDataExtractorClient';
import { UseCase } from '../UseCase';
import { CreateCompanyMonitoringUseCaseInput } from './input';

export class CreateCompanyMonitoringUseCase
	implements UseCase<CreateCompanyMonitoringUseCaseInput, void>
{
	private lawsuitDataExtractorClient: LawsuitDataExtractorClient;
	private eventCompanyMonitoringRepository: EventCompanyMonitoringRepository;

	constructor(
		lawsuitDataExtractorClient: LawsuitDataExtractorClient,
		eventCompanyMonitoringRepository: EventCompanyMonitoringRepository
	) {
		this.lawsuitDataExtractorClient = lawsuitDataExtractorClient;
		this.eventCompanyMonitoringRepository = eventCompanyMonitoringRepository;
	}

	public async execute(input: CreateCompanyMonitoringUseCaseInput): Promise<void> {
		try {
			const isCompanyAlreadyMonitored =
				await this.lawsuitDataExtractorClient.verifyIfTermIsAlreadyMonitored(input.cnpj);

			if (isCompanyAlreadyMonitored) {
				console.info(`CNPJ ${input.cnpj} is already monitored for new lawsuits`);
				return;
			}

			const monitoredCnpj = await this.lawsuitDataExtractorClient.createTermMonitoring(input.cnpj);

      const event = new EventCompanyMonitoring(
        monitoredCnpj.term,
        monitoredCnpj.variationTerm,
        monitoredCnpj.externalId,
        new Date()
      );
      await this.eventCompanyMonitoringRepository.put(event);
		} catch (error) {
			console.error(`Cannot setup monitoring for CNPJ ${input.cnpj}`, error);
			throw error;
		}
	}
}
