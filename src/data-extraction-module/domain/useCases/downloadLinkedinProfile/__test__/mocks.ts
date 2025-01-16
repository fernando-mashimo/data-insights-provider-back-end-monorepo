import {
	EventExtractLinkedin,
	EventExtractLinkedinStatus
} from '../../../entities/eventExtractLinkedin';
import { EventExtractLinkedinRepository } from '../../../repositories/eventExtractLinkedinRepository';
import { FileManagementClient } from '../../../services/fileManagementClient';
import {
	GenericDataSetExtractionResponse,
	LinkedinExtractorClient
} from '../../../services/linkedinExtractorClient';

export class EventExtractLinkedinRepositoryMock implements EventExtractLinkedinRepository {
	getByNameAndLastExtractionDate(): Promise<EventExtractLinkedin[]> {
		throw new Error('Method not implemented.');
	}
	put = jest.fn();
	getById = jest.fn<Promise<EventExtractLinkedin>, [string]>().mockResolvedValue({
		requestedName: 'FirstName LastName',
		searchedFirstName: 'FirstName',
		searchedLastName: 'LastName',
		status: EventExtractLinkedinStatus.PENDING,
		errorMsg: undefined,
		startDate: new Date(),
		endDate: undefined,
		id: 'snapshot_id',
		snapshotId: 'snapshot_id',
		numberOfProfilesFounded: undefined
	});
}

export class FileManagementClientMock implements FileManagementClient {
	uploadFile = jest.fn();
	downloadPdfFile = jest.fn();
}

export class LinkedinExtractorClientMock implements LinkedinExtractorClient {
	triggerProfileExtractByName = jest.fn();
	getExtractedProfile = jest
		.fn<Promise<GenericDataSetExtractionResponse>, [string]>()
		.mockResolvedValue({});
}
