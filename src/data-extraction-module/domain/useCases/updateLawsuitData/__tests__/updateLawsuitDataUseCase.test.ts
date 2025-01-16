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

let spyOnEventUpdateLawsuitRepositoryGetByCnjAndStatus: jest.SpyInstance;
let spyOnLawsuitDataUpdateClientGetLawsuitSubscriptionByCnj: jest.SpyInstance;
let spyOnLawsuitDataUpdateClientGetUpdatedLawsuitData: jest.SpyInstance;
let spyOnLawsuitDataUpdateClientCreateLawsuitSubscription: jest.SpyInstance;
let spyOnFileManagementClientUploadFile: jest.SpyInstance;
let spyOnFileManagementClientDownloadFile: jest.SpyInstance;
let spyOnEventUpdateLawsuitRepositoryPut: jest.SpyInstance;

beforeEach(() => {
	jest.restoreAllMocks();

	spyOnEventUpdateLawsuitRepositoryGetByCnjAndStatus = jest
		.spyOn(EventUpdateLawsuitRepositoryMock.prototype, 'getByCnjAndStatus')
		.mockImplementation(() => Promise.resolve([EventUpdateLawsuitMock]));

	spyOnLawsuitDataUpdateClientGetLawsuitSubscriptionByCnj = jest
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

	spyOnLawsuitDataUpdateClientCreateLawsuitSubscription = jest
		.spyOn(LawsuitDataUpdateClientMock.prototype, 'createLawsuitSubscription')
		.mockImplementation(() => Promise.resolve());

	spyOnLawsuitDataUpdateClientGetUpdatedLawsuitData = jest
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

	spyOnFileManagementClientUploadFile = jest
		.spyOn(FileManagementClientMock.prototype, 'uploadFile')
		.mockImplementation(() => Promise.resolve());

	spyOnFileManagementClientDownloadFile = jest
		.spyOn(FileManagementClientMock.prototype, 'downloadPdfFile')
		.mockImplementation(() => Promise.resolve(Buffer.from('')));

	spyOnEventUpdateLawsuitRepositoryPut = jest
		.spyOn(EventUpdateLawsuitRepositoryMock.prototype, 'put')
		.mockImplementation(() => Promise.resolve());

	spyOnEventUpdateLawsuitRepositoryPut = jest
		.spyOn(EventUpdateLawsuitRepositoryMock.prototype, 'put')
		.mockImplementation(() => Promise.resolve());
});

test('Should update lawsuit data and download document and persist them at S3', async () => {
	await useCase.execute(baseInput);

	expect(spyOnFileManagementClientUploadFile).toHaveBeenCalledWith(
		expect.any(String),
		'application/json',
		Buffer.from(JSON.stringify([{ anyKey: 'anyValue' }]))
	);
	expect(spyOnFileManagementClientUploadFile).toHaveBeenCalledWith(
		expect.any(String),
		'application/pdf',
		Buffer.from('')
	);
	expect(spyOnEventUpdateLawsuitRepositoryPut).toHaveBeenCalledWith(
		expect.objectContaining<Partial<EventUpdateLawsuit>>({
			cnj: EventUpdateLawsuitMock.cnj,
			startDate: EventUpdateLawsuitMock.startDate,
			status: EventUpdateLawsuitStatus.FINISHED,
			endDate: expect.any(Date)
		})
	);
});

test('Should create an event with current date as start date if no events with status PENDING are found in the database', async () => {
	spyOnEventUpdateLawsuitRepositoryGetByCnjAndStatus.mockImplementation(() => Promise.resolve([]));

	await useCase.execute(baseInput);

	expect(spyOnEventUpdateLawsuitRepositoryPut).toHaveBeenCalledWith(
		expect.objectContaining<Partial<EventUpdateLawsuit>>({
			cnj: baseInput.cnj,
			startDate: expect.any(Date),
			status: EventUpdateLawsuitStatus.FINISHED,
			endDate: expect.any(Date)
		})
	);
});

test('Should create a lawsuit/CNJ subscription in the external API service if no subscriptions are found for the input CNJ', async () => {
	spyOnLawsuitDataUpdateClientGetLawsuitSubscriptionByCnj.mockImplementation(() =>
		Promise.resolve(undefined)
	);

	await useCase.execute(baseInput);

	expect(spyOnLawsuitDataUpdateClientCreateLawsuitSubscription).toHaveBeenCalledWith(baseInput.cnj);
	expect(spyOnEventUpdateLawsuitRepositoryPut).toHaveBeenCalledWith(expect.any(EventUpdateLawsuit));
  expect(spyOnLawsuitDataUpdateClientGetUpdatedLawsuitData).not.toHaveBeenCalled();
  expect(spyOnFileManagementClientUploadFile).not.toHaveBeenCalled();
  expect(spyOnFileManagementClientDownloadFile).not.toHaveBeenCalled();
});
