import { UpdateLawsuitDataUseCase } from '..';
import { EventUpdateLawsuitMock } from '../../../../tests/mocks/entities/eventUpdateLawsuitMock';
import { EventUpdateLawsuitRepositoryMock } from '../../../../tests/mocks/repositories/eventUpdateLawsuitRepositoryMock';
import { LawsuitDataUpdateClientMock } from '../../../../tests/mocks/services/lawsuitDataUpdateClientMock';
import { FileManagementClientMock } from '../../../../tests/mocks/services/fileManagementClientMock';
import { EventUpdateLawsuit, EventUpdateLawsuitStatus } from '../../../entities/eventUpdateLawsuit';

const lawsuitDataUpdateClient = new LawsuitDataUpdateClientMock();
const fileManagementClient = new FileManagementClientMock();
const eventUpdateLawsuitRepository = new EventUpdateLawsuitRepositoryMock();
const useCase = new UpdateLawsuitDataUseCase(
	lawsuitDataUpdateClient,
	fileManagementClient,
	eventUpdateLawsuitRepository
);

const baseInput = {
	cnj: 'inputCnj'
};

beforeEach(() => {
	jest.restoreAllMocks();

	jest
		.spyOn(EventUpdateLawsuitRepositoryMock.prototype, 'getByCnjAndStatus')
		.mockImplementation(() => Promise.resolve([EventUpdateLawsuitMock]));

	jest
		.spyOn(LawsuitDataUpdateClientMock.prototype, 'getLawsuitSubscriptionByCnj')
		.mockImplementation(() =>
			Promise.resolve({
				id: '123',
				type: 'anyType',
				value: 'cnj',
				status: 'anyStatus',
				availability: 'anyAvailability',
				createdAt: 'anyCreatedAt',
				updatedAt: 'anyUpdatedAt'
			})
		);

	jest
		.spyOn(LawsuitDataUpdateClientMock.prototype, 'createLawsuitSubscription')
		.mockImplementation(() => Promise.resolve());

	jest
		.spyOn(LawsuitDataUpdateClientMock.prototype, 'getUpdatedLawsuitData')
		.mockImplementation(() =>
			Promise.resolve({
				updatedData: [
					{
						anyKey: 'anyValue'
					}
				],
				documentsUrls: ['url']
			})
		);

	jest
		.spyOn(FileManagementClientMock.prototype, 'uploadFile')
		.mockImplementation(() => Promise.resolve());

	jest
		.spyOn(FileManagementClientMock.prototype, 'downloadPdfFile')
		.mockImplementation(() => Promise.resolve(Buffer.from('')));

	jest
		.spyOn(EventUpdateLawsuitRepositoryMock.prototype, 'put')
		.mockImplementation(() => Promise.resolve());

	jest
		.spyOn(EventUpdateLawsuitRepositoryMock.prototype, 'put')
		.mockImplementation(() => Promise.resolve());
});

test('Should update lawsuit data and download document and persist them at S3', async () => {
	await useCase.execute(baseInput);

	expect(fileManagementClient.uploadFile).toHaveBeenCalledWith(
		expect.any(String),
		'application/json',
		Buffer.from(JSON.stringify([{ anyKey: 'anyValue' }]))
	);
	expect(fileManagementClient.uploadFile).toHaveBeenCalledWith(
		expect.any(String),
		'application/pdf',
		Buffer.from('')
	);
	expect(eventUpdateLawsuitRepository.put).toHaveBeenCalledWith(
		expect.objectContaining<Partial<EventUpdateLawsuit>>({
			cnj: EventUpdateLawsuitMock.cnj,
			startDate: EventUpdateLawsuitMock.startDate,
			status: EventUpdateLawsuitStatus.FINISHED,
			endDate: expect.any(Date)
		})
	);
});

test('Should create an event with current date as start date if no events with status PENDING are found in the database', async () => {
	jest
		.spyOn(EventUpdateLawsuitRepositoryMock.prototype, 'getByCnjAndStatus')
		.mockImplementation(() => Promise.resolve([]));

	await useCase.execute(baseInput);

	expect(eventUpdateLawsuitRepository.put).toHaveBeenCalledWith(
		expect.objectContaining<Partial<EventUpdateLawsuit>>({
			cnj: baseInput.cnj,
			startDate: expect.any(Date),
			status: EventUpdateLawsuitStatus.FINISHED,
			endDate: expect.any(Date)
		})
	);
});

test('Should create a lawsuit/CNJ subscription in the external API service if no subscriptions are found for the input CNJ', async () => {
	jest
		.spyOn(LawsuitDataUpdateClientMock.prototype, 'getLawsuitSubscriptionByCnj')
		.mockImplementation(() => Promise.resolve(undefined));

	await useCase.execute(baseInput);

	expect(lawsuitDataUpdateClient.createLawsuitSubscription).toHaveBeenCalledWith(baseInput.cnj);
	expect(eventUpdateLawsuitRepository.put).toHaveBeenCalledWith(expect.any(EventUpdateLawsuit));
	expect(lawsuitDataUpdateClient.getUpdatedLawsuitData).not.toHaveBeenCalled();
	expect(fileManagementClient.uploadFile).not.toHaveBeenCalled();
	expect(fileManagementClient.downloadPdfFile).not.toHaveBeenCalled();
});
