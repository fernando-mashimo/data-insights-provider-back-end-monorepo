import { MetabaseClient } from '../../../services/MetabaseClient';

export class MetabaseClientMock implements MetabaseClient {
	getEmbedDashboardUrl = jest.fn().mockReturnValue('dashboard_url');
	getDashboardCardsIds = jest.fn();
	updateDashboardCard = jest.fn();
}
