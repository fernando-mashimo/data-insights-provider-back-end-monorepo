import { Dashboard } from '../entities/Dashboard';

export type PreFilters = {
	cnpj?: string;
};

export interface MetabaseClient {
	getEmbedDashboardUrl(dashboard: Dashboard, preFilters: PreFilters): string;
	getDashboardCardsIds(): Promise<string[]>;
	updateDashboardCard(cardId: string): Promise<void>;
}
