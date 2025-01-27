import { EventCompanyMonitoringRepository } from '../../../domain/repositories/eventCompanyMonitoringRepository';

export class EventCompanyMonitoringRepositoryMock implements EventCompanyMonitoringRepository {
	put(): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
