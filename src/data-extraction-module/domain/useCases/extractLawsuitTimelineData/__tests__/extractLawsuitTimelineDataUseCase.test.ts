import { ExtractLawsuitTimelineDataUseCase } from '..';
import { EventExtractLawsuitTimelineMock } from '../../../../tests/mocks/entities/eventExtractLawsuitTimelineMock';
import { EventExtractLawsuitTimelineRepositoryMock } from '../../../../tests/mocks/repositories/eventExtractLawsuitTimelineRepositoryMock';
import { FileManagementClientMock } from '../../../../tests/mocks/services/fileManagementClientMock';
import { LawsuitTimelineDataExtractorClientMock } from '../../../../tests/mocks/services/lawsuitTimelineDataExtractorClientMock';
import {
	EventExtractLawsuitTimeline,
	EventExtractLawsuitTimelineStatus
} from '../../../entities/eventExtractLawsuitTimeline';

const lawsuitTimelineDataExtractorClient = new LawsuitTimelineDataExtractorClientMock();
const fileManagementClient = new FileManagementClientMock();
const eventExtractLawsuitTimelineRepository = new EventExtractLawsuitTimelineRepositoryMock();
const useCase = new ExtractLawsuitTimelineDataUseCase(
	lawsuitTimelineDataExtractorClient,
	fileManagementClient,
	eventExtractLawsuitTimelineRepository
);

const baseInput = {
	cnj: '123456'
};

beforeEach(() => {
	jest.restoreAllMocks();

	jest
		.spyOn(EventExtractLawsuitTimelineRepositoryMock.prototype, 'getByCnjAndLastExtractionDate')
		.mockImplementation(() => Promise.resolve([EventExtractLawsuitTimelineMock]));

	jest
		.spyOn(EventExtractLawsuitTimelineRepositoryMock.prototype, 'put')
		.mockImplementation(() => Promise.resolve());

	jest
		.spyOn(LawsuitTimelineDataExtractorClientMock.prototype, 'getLawsuitTimeline')
		.mockImplementation(() =>
			Promise.resolve({
				timeline: [{ someKey: 'someValue' }],
				hasNext: false,
				nextPageUrl: null
			})
		);

	jest
		.spyOn(FileManagementClientMock.prototype, 'uploadFile')
		.mockImplementation(() => Promise.resolve());

	jest
		.spyOn(EventExtractLawsuitTimelineRepositoryMock.prototype, 'put')
		.mockImplementation(() => Promise.resolve());
});

test('Should extract timeline data from external API and persist them', async () => {
	await useCase.execute(baseInput);

	expect(fileManagementClient.uploadFile).toHaveBeenCalledWith(
		expect.any(String),
		'application/json',
		expect.any(Buffer)
	);
	expect(eventExtractLawsuitTimelineRepository.put).toHaveBeenCalledWith(
		expect.objectContaining<Partial<EventExtractLawsuitTimeline>>({
			status: EventExtractLawsuitTimelineStatus.FINISHED,
			endDate: expect.any(Date)
		})
	);
});

test('Should not extract timeline data if it has been recently extracted', async () => {
	const recentlyExtractedEvent = new EventExtractLawsuitTimeline(
		'123456',
		EventExtractLawsuitTimelineStatus.FINISHED,
		new Date()
	);
	jest
		.spyOn(EventExtractLawsuitTimelineRepositoryMock.prototype, 'getByCnjAndLastExtractionDate')
		.mockImplementation(() => Promise.resolve([recentlyExtractedEvent]));

	await useCase.execute(baseInput);

	expect(eventExtractLawsuitTimelineRepository.put).not.toHaveBeenCalled()
	expect(lawsuitTimelineDataExtractorClient.getLawsuitTimeline).not.toHaveBeenCalled();
	expect(fileManagementClient.uploadFile).not.toHaveBeenCalled();
});

test('Should call EventExtractLawsuitTimeline repository 3 times and extract timeline data and persist them if no existing event with given CNJ is found', async () => {
	jest
		.spyOn(EventExtractLawsuitTimelineRepositoryMock.prototype, 'getByCnjAndLastExtractionDate')
		.mockImplementation(() => Promise.resolve([]));

	jest
		.spyOn(EventExtractLawsuitTimelineRepositoryMock.prototype, 'put')
		.mockImplementation(() => Promise.resolve());

	await useCase.execute(baseInput);

	expect(eventExtractLawsuitTimelineRepository.put).toHaveBeenCalledTimes(3);
	expect(lawsuitTimelineDataExtractorClient.getLawsuitTimeline).toHaveBeenCalledTimes(1);
	expect(fileManagementClient.uploadFile).toHaveBeenCalledTimes(1);
});
