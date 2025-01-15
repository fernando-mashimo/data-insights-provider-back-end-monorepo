import { LawsuitsDataUpdateQueue } from '../../queues/lawsuitDataUpdateQueue';
import { LawsuitDataUpdateClient } from '../../services/lawsuitDataUpdateClient';
import { UseCase } from '../UseCase';

export class TriggerUpdateLawsuitDataUseCase implements UseCase<void, void> {
	private lawsuitDataUpdateClient: LawsuitDataUpdateClient;
	private lawsuitsDataUpdateQueue: LawsuitsDataUpdateQueue;

	constructor(
		lawsuitDataUpdateClient: LawsuitDataUpdateClient,
		lawsuitsDataUpdateQueue: LawsuitsDataUpdateQueue
	) {
		this.lawsuitDataUpdateClient = lawsuitDataUpdateClient;
		this.lawsuitsDataUpdateQueue = lawsuitsDataUpdateQueue;
	}

	public async execute(): Promise<void> {
		try {
			const unsyncedLawsuitsSubscriptions =
				await this.lawsuitDataUpdateClient.getUnsyncedLawsuitsSubscriptions();

			if (!unsyncedLawsuitsSubscriptions.length) return;

			const unsyncedLawsuitsSubscriptionsIds = unsyncedLawsuitsSubscriptions.map(
				(subscription) => subscription.id
			);

			const unsyncedLawsuitsCnjs = [];

			for (const subscriptionId of unsyncedLawsuitsSubscriptionsIds) {
				const lawsuitSubscriptionData =
					await this.lawsuitDataUpdateClient.getLawsuitSubscriptionMetadataById(subscriptionId);

				const cnj = lawsuitSubscriptionData.value.replace(/\D/g, '');

				unsyncedLawsuitsCnjs.push({ cnj });
			}

			await this.lawsuitsDataUpdateQueue.sendUpdateDataMessages({ lawsuits: unsyncedLawsuitsCnjs });
		} catch (error) {
			console.error('Cannot trigger update lawsuit data', error);
			throw error;
		}
	}
}
