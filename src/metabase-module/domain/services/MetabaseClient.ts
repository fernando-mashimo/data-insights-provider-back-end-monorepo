import { Dashboard } from '../entities/Dashboard';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type PreFilters = {};

export interface MetabaseClient {
	getEmbedDashboardUrl(dashboard: Dashboard, preFilters: PreFilters): string;
	getDashboardCardsIds(): Promise<string[]>;
	updateDashboardCard(cardId: string): Promise<void>;
}
