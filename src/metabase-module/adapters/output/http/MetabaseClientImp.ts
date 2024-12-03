import * as jwt from 'jsonwebtoken';
import { $config } from '$config';
import { Dashboards, MetabaseClient, PreFilters } from '../../../domain/services/MetabaseClient';

export class MetabaseClientImp implements MetabaseClient {
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
				`Cannot get dashboard url for dashboard ${dashboard} and preFilters ${JSON.stringify(preFilters)}`,
				error
			);
			throw error;
		}
	}
}
