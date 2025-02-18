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
import { ExtractLawsuitDocumentUseCaseInput } from '../../../../domain/useCases/extractLawsuitDocument/input';
import { EventExtractLawsuitDocumentAsyncRepositoryImp } from '../../../output/database/eventExtractLawsuitDocumentAsyncRepositoryImp';
import { LawsuitDocumentDownloadAndPersistQueueImp } from '../../../output/sqs/lawsuitDocumentDownloadAndPersistQueueImp';
import { ExtractLawsuitDocumentUseCase } from '../../../../domain/useCases/extractLawsuitDocument';

/**
 * This function is responsible for handling data received from Escavador callback.
 * It receives the data from the SQS event and sends it to the (respective) use case.
 *
 * The event types are:
 * 1 - 'novo_processo' (NEW_LAWSUIT)
 * 2 - 'atualizacao_processo_concluida' (UPDATE_LAWSUIT)
 * 3 - 'resultado_processo_async' (EXTRACT_LAWSUIT_DOCUMENT)
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

const eventExtractLawsuitDocumentAsyncRepository =
	new EventExtractLawsuitDocumentAsyncRepositoryImp();
const lawsuitDocumentExtractionQueue = new LawsuitDocumentDownloadAndPersistQueueImp();
const extractLawsuitDocumentUseCase = new ExtractLawsuitDocumentUseCase(
	eventExtractLawsuitDocumentAsyncRepository,
	lawsuitDocumentExtractionQueue,
	fileManagementClient
);

export const handler = async (event: SQSEvent): Promise<void> => {
	const body = JSON.parse(event.Records[0].body) as sqsEventBody;

	if (body.event === CallbackEventType.NEW_LAWSUITS_FOUND) {
		console.info('Escavador callback handling with flow: Handle company monitoring received data');

		const useCaseInput: HandleCompanyMonitoringReceivedDataUseCaseInput = {
			monitoredCnpj: body.monitoramento.termo,
			variationCnpj: body.monitoramento.variacoes[0],
			externalId: body.monitoramento.id.toString(),
			receivedData: body.processo
		};

		await handleCompanyMonitoringReceivedDataUseCase.execute(useCaseInput);

		return;
	}

	if (body.event === CallbackEventType.LAWSUIT_DATA_UPDATED) {
		console.info(
			'Escavador callback handling with flow: Extract updated lawsuit data asynchronously'
		);

		const useCaseInput: ExtractUpdatedLawsuitDataAsyncUseCaseInput = {
			cnj: body.atualizacao.numero_cnj.replace(/\D/g, ''),
			asyncProcessExternalId: body.atualizacao.id.toString()
		};

		await extractUpdatedLawsuitDataAsyncUseCase.execute(useCaseInput);

		return;
	}

	if (body.event === CallbackEventType.EXTRACT_LAWSUIT_DOCUMENT) {
		console.info('Escavador callback handling with flow: Extract lawsuit document');

		const { id, numero_processo, resposta, status, motivo_erro } = body;
		const cleanCnj = numero_processo.replace(/\D/g, '');

		if (status !== 'SUCESSO')
			throw new Error(
				`Error extracting lawsuit document or lawsuit not found by async process for CNJ ${cleanCnj}\n
        Reason provided by Escavador: ${motivo_erro}`
			);

		const lawsuitDocumentsData: { url: string, fileHash: string }[] = [];

		for (const item of resposta.instancias) {
			if (item.documentos_restritos && item.documentos_restritos.length)
				item.documentos_restritos.forEach((document) =>
					lawsuitDocumentsData.push({ url: document.link_api, fileHash: document.hash })
				);
		}

		const useCaseInput: ExtractLawsuitDocumentUseCaseInput = {
			cnj: cleanCnj,
			asyncProcessExternalId: id.toString(),
			lawsuitData: body,
			lawsuitDocumentsData
		};

		await extractLawsuitDocumentUseCase.execute(useCaseInput);

		return;
	}

	throw new Error('Invalid Escavador event type');
};
