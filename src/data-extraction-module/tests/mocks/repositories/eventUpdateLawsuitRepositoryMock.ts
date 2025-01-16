import { EventUpdateLawsuit } from '../../../domain/entities/eventUpdateLawsuit';
import { EventUpdateLawsuitRepository } from '../../../domain/repositories/eventUpdateLawsuitRepository';

export class EventUpdateLawsuitRepositoryMock implements EventUpdateLawsuitRepository {
	put(): Promise<void> {
		throw new Error('Method not implemented.');
	}
	getByCnjAndStatus(): Promise<EventUpdateLawsuit[]> {
		throw new Error('Method not implemented.');
	}
}
