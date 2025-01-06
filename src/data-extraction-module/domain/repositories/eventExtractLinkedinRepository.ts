import { EventExtractLinkedin } from '../entities/eventExtractLinkedin';

export interface EventExtractLinkedinRepository {
	/**
	 * create or replace item by id
	 */
	put(event: EventExtractLinkedin): Promise<void>;

	getById(id: string): Promise<EventExtractLinkedin>;

	getByNameAndLastExtractionDate(
		firstName: string,
		lastName: string,
		lastUpdate: Date
	): Promise<EventExtractLinkedin[]>;
}
