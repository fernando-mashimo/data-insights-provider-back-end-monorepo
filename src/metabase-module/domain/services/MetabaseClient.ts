// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type PreFilters = {};

export enum Dashboards {
	TEST = 1
}

export interface MetabaseClient {
	getEmbedDashboardUrl(dashboard: Dashboards, preFilters: PreFilters): string;
	getDashboardCardsIds(): Promise<string[]>;
	updateDashboardCard(cardId: string, dashboardId: number): Promise<void>;
}
