import {
	GenericExtractedData,
	LawsuitDataExtractionResponse,
	LawsuitDataExtractorClient,
	LawsuitDocumentExtractionAsyncProcess,
	MonitoredTerm
} from '../../../domain/services/lawsuitDataExtractorClient';

export class LawsuitDataExtractorClientMock implements LawsuitDataExtractorClient {
	createLawsuitUpdateAsyncProcess(): Promise<LawsuitDocumentExtractionAsyncProcess> {
		throw new Error('Method not implemented.');
	}
	getLawsuitDataByCnj(): Promise<GenericExtractedData> {
		throw new Error('Method not implemented.');
	}
	getLawsuitsByCnpj(): Promise<LawsuitDataExtractionResponse> {
		throw new Error('Method not implemented.');
	}
	verifyIfTermIsAlreadyMonitored(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	createTermMonitoring(): Promise<MonitoredTerm> {
		throw new Error('Method not implemented.');
	}
}
