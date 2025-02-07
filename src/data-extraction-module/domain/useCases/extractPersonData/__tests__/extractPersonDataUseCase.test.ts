import { ExtractPersonDataUseCase } from '..';
import { EventExtractPersonDataMock } from '../../../../tests/mocks/entities/eventExtractPersonDataMock';
import { EventExtractPersonDataRepositoryMock } from '../../../../tests/mocks/repositories/eventExtractPersonDataRepositoryMock';
import { FileManagementClientMock } from '../../../../tests/mocks/services/fileManagementClientMock';
import { PersonDataExtractorClientMock } from '../../../../tests/mocks/services/personDataExtractorClientMock';
import {
	EventExtractPersonData,
	EventExtractPersonDataStatus
} from '../../../entities/eventExtractPersonData';
import { ExtractPersonDataUseCaseInput } from '../input';

const eventExtractPersonDataRepository = new EventExtractPersonDataRepositoryMock();
const personDataExtractorClient = new PersonDataExtractorClientMock();
const fileManagementClient = new FileManagementClientMock();
const useCase = new ExtractPersonDataUseCase(
	eventExtractPersonDataRepository,
	personDataExtractorClient,
	fileManagementClient
);

const baseInput: ExtractPersonDataUseCaseInput = {
	cpf: '12345678900'
};

beforeEach(() => {
	jest.restoreAllMocks();

	jest
		.spyOn(EventExtractPersonDataRepositoryMock.prototype, 'getByCpfAndLastExtractionDate')
		.mockImplementation(() => Promise.resolve([EventExtractPersonDataMock()]));

	jest
		.spyOn(PersonDataExtractorClientMock.prototype, 'getBasicData')
		.mockImplementation(() => Promise.resolve({ anyKey: 'anyValue' }));

	jest
		.spyOn(PersonDataExtractorClientMock.prototype, 'getFinancialData')
		.mockImplementation(() => Promise.resolve({ anyKey: 'anyValue' }));

	jest
		.spyOn(PersonDataExtractorClientMock.prototype, 'getLawsuitsData')
		.mockImplementation(() => Promise.resolve({ anyKey: 'anyValue' }));

	jest
		.spyOn(FileManagementClientMock.prototype, 'uploadFile')
		.mockImplementation(() => Promise.resolve());

	jest
		.spyOn(EventExtractPersonDataRepositoryMock.prototype, 'put')
		.mockImplementation(() => Promise.resolve());
});

test('Should extract person data and persist at S3 and register an Event in the database with status FINISHED', async () => {
	await useCase.execute(baseInput);

	expect(fileManagementClient.uploadFile).toHaveBeenCalledWith(
		expect.stringContaining(`people/basic/big-data-corp/${baseInput.cpf}`),
		'application/json',
		expect.any(Buffer)
	);
	expect(fileManagementClient.uploadFile).toHaveBeenCalledWith(
		expect.stringContaining(`people/financial/big-data-corp/${baseInput.cpf}`),
		'application/json',
		expect.any(Buffer)
	);
	expect(fileManagementClient.uploadFile).toHaveBeenCalledWith(
		expect.stringContaining(`people/lawsuits/big-data-corp/${baseInput.cpf}`),
		'application/json',
		expect.any(Buffer)
	);
	expect(eventExtractPersonDataRepository.put).toHaveBeenCalledWith(
		expect.objectContaining<Partial<EventExtractPersonData>>({
			id: expect.any(String),
			cpf: baseInput.cpf.replace(/\D/g, ''),
			startDate: expect.any(Date),
			status: EventExtractPersonDataStatus.FINISHED,
			endDate: expect.any(Date)
		})
	);
});

test('Should not extract any data if extraction has been recently executed', async () => {
	jest
		.spyOn(EventExtractPersonDataRepositoryMock.prototype, 'getByCpfAndLastExtractionDate')
		.mockImplementation(() => Promise.resolve([EventExtractPersonDataMock(true)]));

	await useCase.execute(baseInput);

	expect(personDataExtractorClient.getBasicData).not.toHaveBeenCalled();
	expect(personDataExtractorClient.getFinancialData).not.toHaveBeenCalled();
	expect(personDataExtractorClient.getLawsuitsData).not.toHaveBeenCalled();
	expect(fileManagementClient.uploadFile).not.toHaveBeenCalled();
});
