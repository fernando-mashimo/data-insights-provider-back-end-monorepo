import { EventExtractLawsuitDocumentAsync } from '../entities/eventExtractLawsuitDocumentAsync';

export interface EventExtractLawsuitDocumentAsyncRepository {
	getByCnjAndLastExtractionDate(
		cnj: string,
		lastExtractionDate: Date
	): Promise<EventExtractLawsuitDocumentAsync[]>;
	put(entity: EventExtractLawsuitDocumentAsync): Promise<void>;
}
