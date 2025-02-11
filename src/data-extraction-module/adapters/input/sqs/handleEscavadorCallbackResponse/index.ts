import { SQSEvent } from 'aws-lambda';
import { HandleCompanyMonitoringReceivedDataUseCase } from '../../../../domain/useCases/handleCompanyMonitoringReceivedData';
import { EventCompanyMonitoringReceivedDataRepositoryImp } from '../../../output/database/eventCompanyMonitoringReceivedDataRepositoryImp';
import { FileManagementClientImp } from '../../../output/file/fileManagementClient';
import { CallbackEventType, sqsEventBody } from './input';
import { HandleCompanyMonitoringReceivedDataUseCaseInput } from '../../../../domain/useCases/handleCompanyMonitoringReceivedData/input';
import { EventUpdateLawsuitAsyncRepositoryImp } from '../../../output/database/eventUpdateLawsuitAsyncRepositoryImp';
import { LawsuitDataExtractorClientImp } from '../../../output/http/lawsuitDataExtractorClientImp';
import { LawsuitTimelineDataExtractorClientImp } from '../../../output/http/lawsuitTimelineDataExtractorClientImp';
import { ExtractUpdatedLawsuitDataAsyncUseCase } from '../../../../domain/useCases/extractUpdatedLawsuitDataAsync';
import { ExtractUpdatedLawsuitDataAsyncUseCaseInput } from '../../../../domain/useCases/extractUpdatedLawsuitDataAsync/input';

/**
 * This function is responsible for handling data received from Escavador callback.
 * It receives the data from the SQS event and sends it to the (respective) use case.
 *
 * The event types are:
 * 1 - 'novo_processo' (NEW_LAWSUIT)
 * 2 - 'atualizacao_processo_concluida' (UPDATE_LAWSUIT)
 *
 * Each event type will trigger a different use case.
 */

const fileManagementClient = new FileManagementClientImp();

const eventCompanyMonitoringReceivedDataRepository =
	new EventCompanyMonitoringReceivedDataRepositoryImp();
const handleCompanyMonitoringReceivedDataUseCase = new HandleCompanyMonitoringReceivedDataUseCase(
	fileManagementClient,
	eventCompanyMonitoringReceivedDataRepository
);

const eventUpdateLawsuitAsyncRepository = new EventUpdateLawsuitAsyncRepositoryImp();
const lawsuitDataExtractorClient = new LawsuitDataExtractorClientImp();
const lawsuitTimelineDataExtractorClient = new LawsuitTimelineDataExtractorClientImp();
const extractUpdatedLawsuitDataAsyncUseCase = new ExtractUpdatedLawsuitDataAsyncUseCase(
	eventUpdateLawsuitAsyncRepository,
	lawsuitDataExtractorClient,
	lawsuitTimelineDataExtractorClient,
	fileManagementClient
);

export const handler = async (event: SQSEvent): Promise<void> => {
	const body = JSON.parse(event.Records[0].body) as sqsEventBody;

	if (body.event === CallbackEventType.NEW_LAWSUITS_FOUND) {
		const useCaseInput: HandleCompanyMonitoringReceivedDataUseCaseInput = {
			monitoredCnpj: body.monitoramento.termo,
			variationCnpj: body.monitoramento.variacoes[0],
			externalId: body.monitoramento.id.toString(),
			receivedData: body.processo
		};

		console.info(
			'Escavador callback handling with flow: Handle company monitoring received data'
		);
		await handleCompanyMonitoringReceivedDataUseCase.execute(useCaseInput);

		return;
	}

	if (body.event === CallbackEventType.LAWSUIT_DATA_UPDATED) {
		const useCaseInput: ExtractUpdatedLawsuitDataAsyncUseCaseInput = {
			cnj: body.atualizacao.numero_cnj.replace(/\D/g, ''),
			asyncProcessExternalId: body.atualizacao.id.toString()
		};

		console.info(
			'Escavador callback handling with flow: Extract updated lawsuit data asynchronously'
		);
		await extractUpdatedLawsuitDataAsyncUseCase.execute(useCaseInput);

		return;
	}

	throw new Error('Invalid Escavador event type');
};
