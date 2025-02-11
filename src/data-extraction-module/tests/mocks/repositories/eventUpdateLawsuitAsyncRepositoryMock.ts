import { EventUpdateLawsuitAsync } from '../../../domain/entities/eventUpdateLawsuitAsync';
import { EventUpdateLawsuitAsyncRepository } from '../../../domain/repositories/eventUpdateLawsuitAsyncRepository';

export class EventUpdateLawsuitAsyncRepositoryMock implements EventUpdateLawsuitAsyncRepository {
	getByCnjAndLastUpdateDate(): Promise<EventUpdateLawsuitAsync[]> {
		throw new Error('Method not implemented.');
	}
	put(): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
