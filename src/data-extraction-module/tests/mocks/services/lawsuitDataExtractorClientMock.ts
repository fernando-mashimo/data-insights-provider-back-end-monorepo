import {
	LawsuitDataExtractionResponse,
	LawsuitDataExtractorClient,
	MonitoredTerm
} from '../../../domain/services/lawsuitDataExtractorClient';

export class LawsuitDataExtractorClientMock implements LawsuitDataExtractorClient {
	getLawsuits(): Promise<LawsuitDataExtractionResponse> {
		throw new Error('Method not implemented.');
	}
	verifyIfTermIsAlreadyMonitored(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	createTermMonitoring(): Promise<MonitoredTerm> {
		throw new Error('Method not implemented.');
	}
}
