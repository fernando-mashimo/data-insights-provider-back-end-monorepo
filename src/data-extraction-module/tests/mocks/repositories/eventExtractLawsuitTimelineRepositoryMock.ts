import { EventExtractLawsuitTimeline } from '../../../domain/entities/eventExtractLawsuitTimeline';
import { EventExtractLawsuitTimelineRepository } from '../../../domain/repositories/eventExtractLawsuitTimelineRepository';

export class EventExtractLawsuitTimelineRepositoryMock
	implements EventExtractLawsuitTimelineRepository
{
	put(): Promise<void> {
		throw new Error('Method not implemented.');
	}
	getByCnjAndLastExtractionDate(): Promise<EventExtractLawsuitTimeline[]> {
		throw new Error('Method not implemented.');
	}
}
