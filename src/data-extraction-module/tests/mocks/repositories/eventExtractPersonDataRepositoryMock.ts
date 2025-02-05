import { EventExtractPersonData } from '../../../domain/entities/eventExtractPersonData';
import { EventExtractPersonDataRepository } from '../../../domain/repositories/eventExtractPersonDataRepository';

export class EventExtractPersonDataRepositoryMock implements EventExtractPersonDataRepository {
	getByCpfAndLastExtractionDate(): Promise<EventExtractPersonData[]> {
		throw new Error('Method not implemented.');
	}
	put(): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
