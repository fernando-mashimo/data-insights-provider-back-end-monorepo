import { SQSEvent } from 'aws-lambda';
import { HandleCompanyReceivedDataUseCase } from '../../../../domain/useCases/handleCompanyMonitoringReceivedData';
import { EventCompanyMonitoringReceivedDataRepositoryImp } from '../../../output/database/eventCompanyMonitoringReceivedDataRepositoryImp';
import { FileManagementClientImp } from '../../../output/file/fileManagementClient';
import { sqsEventBody } from './input';
import { HandleCompanyMonitoringReceivedDataUseCaseInput } from '../../../../domain/useCases/handleCompanyMonitoringReceivedData/input';

const fileManagementClient = new FileManagementClientImp();
const eventCompanyMonitoringReceivedDataRepository =
	new EventCompanyMonitoringReceivedDataRepositoryImp();
const useCase = new HandleCompanyReceivedDataUseCase(
	fileManagementClient,
	eventCompanyMonitoringReceivedDataRepository
);

export const handler = async (event: SQSEvent): Promise<void> => {
	const body = JSON.parse(event.Records[0].body) as sqsEventBody;

	const useCaseInput: HandleCompanyMonitoringReceivedDataUseCaseInput = {
		monitoredCnpj: body.monitoramento.termo,
		variationCnpj: body.monitoramento.variacoes[0],
		externalId: body.monitoramento.id.toString(),
		receivedData: body.processo
	};

	await useCase.execute(useCaseInput);
};
