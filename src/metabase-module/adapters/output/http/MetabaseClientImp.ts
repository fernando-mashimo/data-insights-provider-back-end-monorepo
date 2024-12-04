import * as jwt from 'jsonwebtoken';
import { $config } from '$config';
import { Dashboards, MetabaseClient, PreFilters } from '../../../domain/services/MetabaseClient';
import axios, { Axios } from 'axios';

export class MetabaseClientImp implements MetabaseClient {
	private client: Axios;

	constructor() {
		this.client = axios.create();
	}

	public getEmbedDashboardUrl(dashboard: Dashboards, preFilters: PreFilters): string {
		try {
			const dashboardId = dashboard;
			const payload = {
				resource: { dashboard: dashboardId },
				params: preFilters as Record<string, string>,
				exp: Math.round(Date.now() / 1000) + $config.BI_EMBED_URL_EXPIRATION_IN_MINUTES * 60
			};
			const embedToken = jwt.sign(payload, $config.BI_EMBED_ENCODE_SECRET);

			const url = new URL($config.BI_API_URL);
			url.pathname = `/embed/dashboard/${embedToken}`;
			url.hash = 'bordered=true&titled=true';

			return url.toString();
		} catch (error) {
			console.error(
				`Cannot get dashboard url in Metabase Client for dashboard ${dashboard} and preFilters ${JSON.stringify(preFilters)}`,
				error
			);
			throw error;
		}
	}

	public async getDashboardCardsIds(): Promise<string[]> {
		try {
			const url = new URL($config.BI_API_URL);
			url.pathname = '/api/card';

			const { data } = await this.client.get(url.toString(), {
				headers: {
					'x-api-key': $config.BI_API_KEY
				}
			});

			return data.map((card: { id: number }) => card.id.toString());
		} catch (error) {
			console.error('Cannot get dashboard cards ids in Metabase Client', error);
			throw error;
		}
	}

	public async updateDashboardCard(cardId: string, dashboardId: number): Promise<void> {
		try {
			const url = new URL($config.BI_API_URL);
			url.pathname = `/api/card/${cardId}/query`;

			const payload = {
				ignore_cache: true,
				collection_preview: false,
				dashboard_id: dashboardId
			};

			await this.client.post(url.toString(), payload, {
				headers: {
					'x-api-key': $config.BI_API_KEY
				}
			});
		} catch (error) {
			console.error(`Cannot update dashboard in Metabase Client for card with id ${cardId}`, error);
			throw error;
		}
	}
}
