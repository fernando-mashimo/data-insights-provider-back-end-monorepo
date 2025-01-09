import { EventExtractLawsuits } from '../entities/eventExtractLawsuits';

export interface EventExtractLawsuitRepository {
	/**
	 * create or replace item by id
	 */
	put(event: EventExtractLawsuits): Promise<void>;

	getByCnpjAndLastExtractionDate(
		cnpj: string,
		extractionTimeWindow?: Date
	): Promise<EventExtractLawsuits[]>;
}
