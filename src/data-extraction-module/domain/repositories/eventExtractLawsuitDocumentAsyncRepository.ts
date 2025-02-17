import { EventExtractLawsuitDocumentAsync } from '../entities/eventExtractLawsuitDocumentAsync';

export interface EventExtractLawsuitDocumentAsyncRepository {
	getByCnjAndLastExtractionDate(
		cnj: string,
		lastExtractionDate: Date
	): Promise<EventExtractLawsuitDocumentAsync[]>;
	getByCnjAndExternalId(cnj: string, externalId: string): Promise<EventExtractLawsuitDocumentAsync>;
	put(entity: EventExtractLawsuitDocumentAsync): Promise<void>;
}
