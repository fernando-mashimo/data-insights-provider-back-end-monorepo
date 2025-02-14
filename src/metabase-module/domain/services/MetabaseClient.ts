import { Dashboard } from '../entities/Dashboard';

export type PreFilters = {
	cnpj_dont_change_or_remove?: string;
};

export interface MetabaseClient {
	getEmbedDashboardUrl(dashboard: Dashboard, preFilters: PreFilters): string;
	getDashboardCardsIds(): Promise<string[]>;
	updateDashboardCard(cardId: string): Promise<void>;
}
