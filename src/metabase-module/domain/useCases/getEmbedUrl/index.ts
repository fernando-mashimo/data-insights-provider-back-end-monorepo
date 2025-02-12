import { Dashboard } from '../../entities/Dashboard';
import { ForbiddenError } from '../../errors/forbidenError';
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
			const allowedDashboards = input.loggedInUser.allowedDashboards;

			if (!allowedDashboards.includes(input.dashboard)) {
				throw new ForbiddenError(
					`Dashboard ${input.dashboard} is not allowed for logged in user ${input.loggedInUser.email}`
				);
			}

			const filteredByCompanyCnpj = [Dashboard.TEST_PRE_FILTER];

			const preFilters: PreFilters = {};

			if (filteredByCompanyCnpj.includes(input.dashboard)) {
				preFilters.cnpj = input.loggedInUser.companyCnpj;
			}

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
