import { EventExtractLawsuitTimeline } from '../entities/eventExtractLawsuitTimeline';

export interface EventExtractLawsuitTimelineRepository {
	/**
	 * create or replace item by id
	 */
	put(event: EventExtractLawsuitTimeline): Promise<void>;

	getByCnjAndLastExtractionDate(
		cnj: string,
		extractionTimeWindow?: Date
	): Promise<EventExtractLawsuitTimeline[]>;
}
