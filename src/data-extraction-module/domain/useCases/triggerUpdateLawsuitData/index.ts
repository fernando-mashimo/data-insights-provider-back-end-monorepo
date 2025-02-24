import { LawsuitsDataUpdateQueue } from '../../queues/lawsuitDataUpdateQueue';
import { LawsuitDataUpdateClient } from '../../services/lawsuitDataUpdateClient';
import { UseCase } from '../UseCase';

/**
 * Use case to trigger update lawsuit data flow for unsynced lawsuits subscriptions (at PIPED API)
 *
 * The use case is responsible for:
 * - Fetching unsynced lawsuits subscriptions from PIPED API
 * - Sending update data messages to SQS queue
 * - The update data messages will trigger the update lawsuit data flow
 *
 * This is a scheduled use case that is triggered by a cron job (currently every 00:00 UTC-3 - as of Jan 16th, 2025)
 */
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

			if (!unsyncedLawsuitsSubscriptions.length){
        console.info('No unsynced lawsuits subscriptions found at Piped');
        return;
      };

			const unsyncedLawsuitsSubscriptionsIds = unsyncedLawsuitsSubscriptions.map(
				(subscription) => subscription.id
			);

			const unsyncedLawsuitsCnjs = [];

			for (const subscriptionId of unsyncedLawsuitsSubscriptionsIds) {
				const lawsuitSubscriptionData =
					await this.lawsuitDataUpdateClient.getLawsuitSubscriptionById(subscriptionId);

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
