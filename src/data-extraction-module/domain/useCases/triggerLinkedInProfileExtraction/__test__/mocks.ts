import { EventExtractLinkedinRepository } from '../../../repositories/eventExtractLinkedinRepository';
import { LinkedinExtractorClient } from '../../../services/linkedinExtractorClient';

export class LinkedinExtractorClientMock implements LinkedinExtractorClient {
	triggerProfileExtractByName = jest.fn().mockReturnValue('snapshot_id');
	getExtractedProfile = jest.fn();
}

export class EventExtractLinkedinRepositoryMock implements EventExtractLinkedinRepository {
	put = jest.fn();
	getById = jest.fn().mockResolvedValue(undefined);
}
