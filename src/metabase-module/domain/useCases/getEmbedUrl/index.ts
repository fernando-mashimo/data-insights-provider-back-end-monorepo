import { MetabaseClient, PreFilters } from '../../services/MetabaseClient';
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

	public async execute(input: GetEmbedUrlUseCaseInput): Promise<GetEmbedUrlUseCaseOutput> {
		try {
			const preFilters: PreFilters = {};
			const dashboardUrl = this.metabaseClient.getEmbedDashboardUrl(input.dashboard, preFilters);

			return {
				url: dashboardUrl
			};
		} catch (error) {
			console.error(`Cannot get embed url with input ${JSON.stringify(input)}`, error);
			throw error;
		}
	}
}
