import { Dashboard } from '../entities/Dashboard';

export type PreFilters = {
	cnpj_dont_change_or_remove?: string;
	cnj_dont_change_or_remove?: string; // for ATACADAO_MY_LAWSUITS_DETAIL
};

export interface MetabaseClient {
	getEmbedDashboardUrl(dashboard: Dashboard, preFilters: PreFilters): string;
	getDashboardCardsIds(): Promise<string[]>;
	updateDashboardCard(cardId: string): Promise<void>;
}
