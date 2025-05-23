import { MetabaseClient } from '../../services/MetabaseClient';
import { UseCase } from '../UseCase';

export class UpdateDashboardCardsUseCase implements UseCase<null, void> {
	private metabaseClient: MetabaseClient;

	constructor(metabaseClient: MetabaseClient) {
		this.metabaseClient = metabaseClient;
	}

	public async execute(): Promise<void> {
		try {
      const cardsIds = await this.metabaseClient.getDashboardCardsIds();

			const updatePromises = cardsIds.map(
				(cardId) => this.metabaseClient.updateDashboardCard(cardId)
			);

			await Promise.all(updatePromises);
		} catch (error) {
			console.error('Cannot update dashboard cards', error);
			throw error;
		}
	}
}
