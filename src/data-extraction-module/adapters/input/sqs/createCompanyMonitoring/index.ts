import { SQSEvent } from 'aws-lambda';
import { CreateCompanyMonitoringUseCase } from '../../../../domain/useCases/createCompanyMonitoring';
import { EventCompanyMonitoringRepositoryImp } from '../../../output/database/eventCompanyMonitoringRepositoryImp';
import { LawsuitDataExtractorClientImp } from '../../../output/http/lawsuitDataExtractorClientImp';
import { sqsEventBody } from './input';
import { CreateCompanyMonitoringUseCaseInput } from '../../../../domain/useCases/createCompanyMonitoring/input';

const useCase = new CreateCompanyMonitoringUseCase(
	new LawsuitDataExtractorClientImp(),
	new EventCompanyMonitoringRepositoryImp()
);

export const handler = async (event: SQSEvent): Promise<void> => {
	for (const record of event.Records) {
		const { cnpj } = JSON.parse(record.body) as sqsEventBody;

		const useCaseInput: CreateCompanyMonitoringUseCaseInput = { cnpj };

		await useCase.execute(useCaseInput);
	}
};
