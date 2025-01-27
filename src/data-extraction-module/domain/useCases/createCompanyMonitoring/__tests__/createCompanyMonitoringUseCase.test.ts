import { CreateCompanyMonitoringUseCase } from '..';
import { EventCompanyMonitoringRepositoryMock } from '../../../../tests/mocks/repositories/eventCompanyMonitoringRepositoryMock';
import { LawsuitDataExtractorClientMock } from '../../../../tests/mocks/services/lawsuitDataExtractorClientMock';
import { EventCompanyMonitoring } from '../../../entities/eventCompanyMonitoring';

const lawsuitDataExtractorClient = new LawsuitDataExtractorClientMock();
const eventCompanyMonitoringRepository = new EventCompanyMonitoringRepositoryMock();
const useCase = new CreateCompanyMonitoringUseCase(
	lawsuitDataExtractorClient,
	eventCompanyMonitoringRepository
);

const baseInput = {
	cnpj: '123456'
};

let spyOnEventCompanyMonitoringRepositoryPut: jest.SpyInstance;
let spyOnLawsuitDataExtractorClientCreateTermMonitoring: jest.SpyInstance;

beforeEach(() => {
	jest.restoreAllMocks();

	jest
		.spyOn(LawsuitDataExtractorClientMock.prototype, 'verifyIfTermIsAlreadyMonitored')
		.mockImplementation(() => Promise.resolve(false));

	spyOnLawsuitDataExtractorClientCreateTermMonitoring = jest
		.spyOn(LawsuitDataExtractorClientMock.prototype, 'createTermMonitoring')
		.mockImplementation(() =>
			Promise.resolve({
				term: '123456',
				variationTerm: '123456',
				externalId: '123456'
			})
		);

	spyOnEventCompanyMonitoringRepositoryPut = jest
		.spyOn(EventCompanyMonitoringRepositoryMock.prototype, 'put')
		.mockImplementation(() => Promise.resolve());
});

test('Should create a monitoring for the provided CNPJ and an event in the database if provided CNPJ is valid', async () => {
	await useCase.execute(baseInput);

	expect(spyOnEventCompanyMonitoringRepositoryPut).toHaveBeenCalledWith(
		expect.objectContaining<Partial<EventCompanyMonitoring>>({
			monitoredCnpj: '123456',
			variationCnpj: '123456',
			externalId: '123456',
			id: '123456#ExtId_123456',
			createdAt: expect.any(Date)
		})
	);
});

test('Should not create a monitoring for the provided CNPJ if there is already a monitoring created at the external service', async () => {
	jest
		.spyOn(LawsuitDataExtractorClientMock.prototype, 'verifyIfTermIsAlreadyMonitored')
		.mockImplementation(() => Promise.resolve(true));

	await useCase.execute(baseInput);

  expect(spyOnLawsuitDataExtractorClientCreateTermMonitoring).not.toHaveBeenCalled();
	expect(spyOnEventCompanyMonitoringRepositoryPut).not.toHaveBeenCalled();
});
