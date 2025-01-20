import { TriggerUpdateLawsuitDataUseCase } from '..';
import { LawsuitsDataUpdateQueueMock } from '../../../../tests/mocks/queues/lawsuitsDataUpdateQueueMock';
import { LawsuitDataUpdateClientMock } from '../../../../tests/mocks/services/lawsuitDataUpdateClientMock';

const lawsuitDataUpdateClient = new LawsuitDataUpdateClientMock();
const lawsuitsDataUpdateQueue = new LawsuitsDataUpdateQueueMock();
const useCase = new TriggerUpdateLawsuitDataUseCase(
	lawsuitDataUpdateClient,
	lawsuitsDataUpdateQueue
);

beforeEach(() => {
	jest.restoreAllMocks();

	jest
		.spyOn(LawsuitDataUpdateClientMock.prototype, 'getUnsyncedLawsuitsSubscriptions')
		.mockImplementation(() =>
			Promise.resolve([
				{
					id: 'someId',
					type: 'someType',
					updatedAt: 'someDate'
				}
			])
		);

	jest
		.spyOn(LawsuitDataUpdateClientMock.prototype, 'getLawsuitSubscriptionById')
		.mockImplementation(() =>
			Promise.resolve({
				id: 'someId',
				type: 'someType',
				value: '123-456',
				status: 'someStatus',
				availability: 'someAvailability',
				createdAt: 'someDate',
				updatedAt: 'someOtherDate'
			})
		);

	jest
		.spyOn(LawsuitsDataUpdateQueueMock.prototype, 'sendUpdateDataMessages')
		.mockImplementation(() => Promise.resolve());
});

test('Should send message to lawsuits data update queue when unsynced monitored lawsuits are found at the external lawsuit data extraction API', async () => {
	await useCase.execute();

	expect(lawsuitsDataUpdateQueue.sendUpdateDataMessages).toHaveBeenCalledWith({
		lawsuits: [{ cnj: '123456' }]
	});
});

test('Should not send message to queue when no subscriptions are found', async () => {
  jest
    .spyOn(LawsuitDataUpdateClientMock.prototype, 'getUnsyncedLawsuitsSubscriptions')
    .mockImplementation(() => Promise.resolve([]));

  await useCase.execute();

  expect(lawsuitsDataUpdateQueue.sendUpdateDataMessages).not.toHaveBeenCalled();
});
