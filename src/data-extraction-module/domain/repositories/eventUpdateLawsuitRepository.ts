import { EventUpdateLawsuit, EventUpdateLawsuitStatus } from '../entities/eventUpdateLawsuit';

export interface EventUpdateLawsuitRepository {
	/**
	 * create or replace item by id
	 */
	put(event: EventUpdateLawsuit): Promise<void>;
	getByCnjAndStatus(
		cnj: string,
		status: EventUpdateLawsuitStatus
	): Promise<EventUpdateLawsuit[]>;
}
