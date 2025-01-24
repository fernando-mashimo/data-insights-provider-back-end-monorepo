import { DownloadLinkedinProfileUseCase } from '..';
import {
	EventExtractLinkedin,
	EventExtractLinkedinStatus
} from '../../../entities/eventExtractLinkedin';
import { EventExtractLinkedinRepository } from '../../../repositories/eventExtractLinkedinRepository';
import { FileManagementClient } from '../../../services/fileManagementClient';
import { LinkedinExtractorClient } from '../../../services/linkedinExtractorClient';
import { DownloadLinkedinProfileUseCaseInput } from '../input';
import {
	EventExtractLinkedinRepositoryMock,
	FileManagementClientMock,
	LinkedinExtractorClientMock
} from './mocks';

let eventExtractLinkedinRepository: EventExtractLinkedinRepository;
let fileManagementClient: FileManagementClient;
let linkedinExtractorClient: LinkedinExtractorClient;
let useCase: DownloadLinkedinProfileUseCase;

beforeEach(() => {
	eventExtractLinkedinRepository = new EventExtractLinkedinRepositoryMock();
	fileManagementClient = new FileManagementClientMock();
	linkedinExtractorClient = new LinkedinExtractorClientMock();
	useCase = new DownloadLinkedinProfileUseCase(
		linkedinExtractorClient,
		eventExtractLinkedinRepository,
		fileManagementClient
	);
});

it('Should receive and save linkedin profile data when provided input is valid', async () => {
	const input: DownloadLinkedinProfileUseCaseInput = {
		extractionStatus: EventExtractLinkedinStatus.FINISHED,
		snapshotId: 'snapshot_id',
		error: undefined
	};

	await useCase.execute(input);

	expect(eventExtractLinkedinRepository.getById).toHaveBeenCalledWith('snapshot_id');
	expect(eventExtractLinkedinRepository.put).toHaveBeenCalledWith(
		expect.objectContaining<Partial<EventExtractLinkedin>>({
			requestedName: 'FirstName LastName',
			searchedFirstName: 'FirstName',
			searchedLastName: 'LastName',
			status: EventExtractLinkedinStatus.FINISHED,
			errorMsg: undefined,
			startDate: expect.any(Date),
			endDate: expect.any(Date),
			id: 'snapshot_id',
			numberOfProfilesFounded: 1
		})
	);
	expect(linkedinExtractorClient.getExtractedProfile).toHaveBeenCalledWith('snapshot_id');
	expect(fileManagementClient.uploadFile).toHaveBeenCalledWith(
		'linkedin/profile/brightdata/snapshot_id.json',
		'application/json',
		expect.any(Buffer)
	);
});

it('Should update linkedin profile data with error message when extraction fails', async () => {
	const input: DownloadLinkedinProfileUseCaseInput = {
		extractionStatus: EventExtractLinkedinStatus.ERROR,
		snapshotId: 'snapshot_id',
		error: 'error message'
	};

	await useCase.execute(input);

	expect(eventExtractLinkedinRepository.getById).toHaveBeenCalledWith('snapshot_id');
	expect(eventExtractLinkedinRepository.put).toHaveBeenCalledWith(
		expect.objectContaining<Partial<EventExtractLinkedin>>({
			requestedName: 'FirstName LastName',
			searchedFirstName: 'FirstName',
			searchedLastName: 'LastName',
			status: EventExtractLinkedinStatus.ERROR,
			errorMsg: 'error message',
			startDate: expect.any(Date),
			endDate: expect.any(Date),
			id: 'snapshot_id',
			numberOfProfilesFounded: undefined
		})
	);
	expect(linkedinExtractorClient.getExtractedProfile).not.toHaveBeenCalled();
	expect(fileManagementClient.uploadFile).not.toHaveBeenCalled();
});

it('Should throw an error when snapshotId is not found', async () => {
	const input: DownloadLinkedinProfileUseCaseInput = {
		extractionStatus: EventExtractLinkedinStatus.ERROR,
		snapshotId: 'non_existent_snapshot_id',
		error: 'error message'
	};

	eventExtractLinkedinRepository.getById = jest.fn().mockResolvedValue(undefined);

	await expect(useCase.execute(input)).rejects.toThrow(
		`Linkedin extraction Event with snapshotId ${input.snapshotId} not found`
	);
});

it.skip('Should not perform any action if the event is already finished with error or success', async () => {
	// Not implemented
	// should check if the event is already finished with error or success
	// if it is, should not update the event db, and should not download the extraction data
});
