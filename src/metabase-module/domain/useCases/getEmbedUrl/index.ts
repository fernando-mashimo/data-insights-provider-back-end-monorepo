import { Dashboards, MetabaseClient, PreFilters } from '../../services/MetabaseClient';
import { UseCase } from '../UseCase';
import { GetEmbedUrlUseCaseInput } from './input';
import { GetEmbedUrlUseCaseOutput } from './output';

export class GetEmbedUrlUseCase
	implements UseCase<GetEmbedUrlUseCaseInput, GetEmbedUrlUseCaseOutput>
{
	private metabaseClient: MetabaseClient;

	constructor(metabaseClient: MetabaseClient) {
		this.metabaseClient = metabaseClient;
	}

	public async execute(userAttributes: GetEmbedUrlUseCaseInput): Promise<GetEmbedUrlUseCaseOutput> {
		try {
			const dashboard = Dashboards.TEST;
			const preFilters: PreFilters = {};
			const dashboardUrl = this.metabaseClient.getEmbedDashboardUrl(dashboard, preFilters);

			return {
				url: dashboardUrl
			};
		} catch (error) {
			console.error(`Cannot get embed url with input ${JSON.stringify(userAttributes)}`, error);
			throw error;
		}
	}
}
