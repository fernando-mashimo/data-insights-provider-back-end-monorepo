import { TriggerLinkedInProfileExtractionUseCase } from '..';
import {
	EventExtractLinkedin,
	EventExtractLinkedinStatus
} from '../../../entities/eventExtractLinkedin';
import { EventExtractLinkedinRepository } from '../../../repositories/eventExtractLinkedinRepository';
import { LinkedinExtractorClient } from '../../../services/linkedinExtractorClient';
import { TriggerLinkedInProfileExtractionUseCaseInput } from '../input';
import { EventExtractLinkedinRepositoryMock, LinkedinExtractorClientMock } from './mocks';

let linkedinExtractorClient: LinkedinExtractorClient;
let eventRepository: EventExtractLinkedinRepository;
let useCase: TriggerLinkedInProfileExtractionUseCase;

beforeEach(() => {
	linkedinExtractorClient = new LinkedinExtractorClientMock();
	eventRepository = new EventExtractLinkedinRepositoryMock();
	useCase = new TriggerLinkedInProfileExtractionUseCase(linkedinExtractorClient, eventRepository);
});

it('Should start linkedin extraction, and persist audition data when provided input parameter is valid', async () => {
	const input: TriggerLinkedInProfileExtractionUseCaseInput = {
		name: 'FirstName LastName'
	};

	await useCase.execute(input);

	expect(eventRepository.put).toHaveBeenCalledWith(
		expect.objectContaining<Partial<EventExtractLinkedin>>({
			requestedName: 'FirstName LastName',
			searchedFirstName: 'firstname',
			searchedLastName: 'lastname',
			status: EventExtractLinkedinStatus.PENDING,
			errorMsg: undefined,
			startDate: expect.any(Date),
			endDate: undefined,
			id: 'snapshot_id',
			snapshotId: 'snapshot_id',
			numberOfProfilesFounded: undefined
		})
	);
});

it('Should search for name variations and save them individually in the database', async () => {
	const input: TriggerLinkedInProfileExtractionUseCaseInput = {
		name: 'John Doe Smith Junior'
	};

	await useCase.execute(input);

	const expectedCalls = [
		{
			requestedName: 'John Doe Smith Junior',
			searchedFirstName: 'john',
			searchedLastName: 'junior',
			status: EventExtractLinkedinStatus.PENDING,
			snapshotId: 'snapshot_id'
		},
		{
			requestedName: 'John Doe Smith Junior',
			searchedFirstName: 'john',
			searchedLastName: 'smith',
			status: EventExtractLinkedinStatus.PENDING,
			snapshotId: 'snapshot_id'
		},
		{
			requestedName: 'John Doe Smith Junior',
			searchedFirstName: 'john doe',
			searchedLastName: 'junior',
			status: EventExtractLinkedinStatus.PENDING,
			snapshotId: 'snapshot_id'
		},
		{
			requestedName: 'John Doe Smith Junior',
			searchedFirstName: 'john doe',
			searchedLastName: 'smith',
			status: EventExtractLinkedinStatus.PENDING,
			snapshotId: 'snapshot_id'
		},
		{
			requestedName: 'John Doe Smith Junior',
			searchedFirstName: 'john doe',
			searchedLastName: 'smith junior',
			status: EventExtractLinkedinStatus.PENDING,
			snapshotId: 'snapshot_id'
		}
	];

	expect(eventRepository.put).toHaveBeenCalledTimes(expectedCalls.length);

	expectedCalls.forEach((expectedCall, i) => {
		expect(eventRepository.put).toHaveBeenNthCalledWith(
			i + 1,
			expect.objectContaining<Partial<EventExtractLinkedin>>(expectedCall)
		);
	});
});

it('Should filter name variations already searched on the last 90 days', async () => {
	const input: TriggerLinkedInProfileExtractionUseCaseInput = {
		name: 'John Doe Smith'
	};

	const eventRepositoryGetByNameAndLastExtractionDateMockedResult = [
		{
			requestedName: 'John Doe Smith',
			searchedFirstName: 'john',
			searchedLastName: 'smith',
			status: EventExtractLinkedinStatus.PENDING,
			snapshotId: 'snapshot_id'
		}
	];

	eventRepository.getByNameAndLastExtractionDate = jest
		.fn()
		.mockResolvedValueOnce(eventRepositoryGetByNameAndLastExtractionDateMockedResult);

	const expectedCalls = [
		{
			requestedName: 'John Doe Smith',
			searchedFirstName: 'john',
			searchedLastName: 'smith',
			status: EventExtractLinkedinStatus.PENDING,
			snapshotId: 'snapshot_id'
		},
		{
			requestedName: 'John Doe Smith',
			searchedFirstName: 'john',
			searchedLastName: 'doe',
			status: EventExtractLinkedinStatus.PENDING,
			snapshotId: 'snapshot_id'
		},
		{
			requestedName: 'John Doe Smith',
			searchedFirstName: 'john',
			searchedLastName: 'doe smith',
			status: EventExtractLinkedinStatus.PENDING,
			snapshotId: 'snapshot_id'
		}
	];

	await useCase.execute(input);

	expect(linkedinExtractorClient.triggerProfileExtractByName).toHaveBeenCalledTimes(
		expectedCalls.length - eventRepositoryGetByNameAndLastExtractionDateMockedResult.length
	);
	expect(eventRepository.put).toHaveBeenCalledTimes(
		expectedCalls.length - eventRepositoryGetByNameAndLastExtractionDateMockedResult.length
	);
});

it('Should not start linkedin extraction when all name variations have been searched in the last 90 days', async () => {
	const input: TriggerLinkedInProfileExtractionUseCaseInput = {
		name: 'John Doe Smith'
	};

	const eventRepositoryGetByNameAndLastExtractionDateMockedResult = [
		{
			requestedName: 'John Doe Smith',
			searchedFirstName: 'john',
			searchedLastName: 'smith',
			status: EventExtractLinkedinStatus.PENDING,
			snapshotId: 'snapshot_id'
		},
		{
			requestedName: 'John Doe Smith',
			searchedFirstName: 'john',
			searchedLastName: 'doe',
			status: EventExtractLinkedinStatus.PENDING,
			snapshotId: 'snapshot_id'
		},
		{
			requestedName: 'John Doe Smith',
			searchedFirstName: 'john',
			searchedLastName: 'doe smith',
			status: EventExtractLinkedinStatus.PENDING,
			snapshotId: 'snapshot_id'
		}
	];

	eventRepository.getByNameAndLastExtractionDate = jest
		.fn()
		.mockResolvedValueOnce(eventRepositoryGetByNameAndLastExtractionDateMockedResult)
		.mockResolvedValueOnce(eventRepositoryGetByNameAndLastExtractionDateMockedResult)
		.mockResolvedValueOnce(eventRepositoryGetByNameAndLastExtractionDateMockedResult);

	await useCase.execute(input);

	expect(linkedinExtractorClient.triggerProfileExtractByName).not.toHaveBeenCalled();
	expect(eventRepository.put).not.toHaveBeenCalled();
});
