import { EventExtractPersonData } from '../entities/eventExtractPersonData';

export interface EventExtractPersonDataRepository {
	getByCpfAndLastExtractionDate(
		cpf: string,
		lastExtractionDate: Date
	): Promise<EventExtractPersonData[]>;
	put(event: EventExtractPersonData): Promise<void>;
}
