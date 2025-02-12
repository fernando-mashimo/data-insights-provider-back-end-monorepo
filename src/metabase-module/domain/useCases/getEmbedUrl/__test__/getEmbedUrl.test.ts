import { GetEmbedUrlUseCase } from '..';
import { Dashboard } from '../../../entities/Dashboard';
import { ForbiddenError } from '../../../errors/forbidenError';
import { MetabaseClient } from '../../../services/MetabaseClient';
import { GetEmbedUrlUseCaseInput } from '../input';
import { MetabaseClientMock } from './mocks';

let metabaseClient: MetabaseClient;
let useCase: GetEmbedUrlUseCase;

beforeEach(() => {
	metabaseClient = new MetabaseClientMock();
	useCase = new GetEmbedUrlUseCase(metabaseClient);
});

it('Should return url when provided inputs are valid', async () => {
	const input: GetEmbedUrlUseCaseInput = {
		dashboard: Dashboard.TEST,
		loggedInUser: {
			allowedDashboards: [Dashboard.TEST],
			id: 'any_id',
			email: 'any_email',
			companyName: 'any_company_name',
			companyCnpj: 'any_company_cnpj'
		}
	};

	const result = await useCase.execute(input);

	expect(result).toEqual({
		url: 'dashboard_url'
	});
});

it('Should return ForbiddenError when user does not have access to the dashboard', async () => {
	const input: GetEmbedUrlUseCaseInput = {
		dashboard: Dashboard.TEST,
		loggedInUser: {
			allowedDashboards: [],
			id: 'any_id',
			email: 'any_email',
			companyName: 'any_company_name',
			companyCnpj: 'any_company_cnpj'
		}
	};

	expect(useCase.execute(input)).rejects.toThrow(ForbiddenError);
});

it('Should apply some pre filters to some dashboards to prevent user see others data', async () => {
	const input: GetEmbedUrlUseCaseInput = {
		dashboard: Dashboard.TEST_PRE_FILTER,
		loggedInUser: {
			allowedDashboards: [Dashboard.TEST_PRE_FILTER],
			id: 'any_id',
			email: 'any_email',
			companyName: 'any_company_name',
			companyCnpj: 'any_company_cnpj'
		}
	};

	await useCase.execute(input);

	expect(metabaseClient.getEmbedDashboardUrl).toHaveBeenCalledWith(Dashboard.TEST_PRE_FILTER, {
		cnpj: 'any_company_cnpj'
	});
});
