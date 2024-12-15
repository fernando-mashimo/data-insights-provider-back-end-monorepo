import { MetabaseClientImp } from '../MetabaseClientImp';
import { $config } from '$config';
import * as jwt from 'jsonwebtoken';
import { Dashboard } from '../../../../domain/entities/Dashboard';

const metabaseClientImp = new MetabaseClientImp();

$config.BI_API_URL = 'http://bi.isdelta.com';
$config.BI_EMBED_ENCODE_SECRET = 'any_key';
$config.BI_EMBED_URL_EXPIRATION_IN_MINUTES = 60;

let spyOnJwtSign: jest.SpyInstance;

beforeEach(() => {
	jest.restoreAllMocks();

	spyOnJwtSign = jest.spyOn(jwt, 'sign').mockImplementation(() => 'any_token');
});

const dashboard = Dashboard.TEST;
const preFilters = {};

describe('Should return a dashboard url', () => {
	test('when provided inputs are valid', async () => {
		const result = metabaseClientImp.getEmbedDashboardUrl(dashboard, preFilters);

		expect(result).toEqual(
			'http://bi.isdelta.com/embed/dashboard/any_token#bordered=true&titled=true'
		);
		expect(spyOnJwtSign).toHaveBeenCalledWith(
			expect.objectContaining({
				resource: { dashboard },
				params: {},
				exp: expect.any(Number)
			}),
			'any_key'
		);
	});
});

describe('Should not return a dashboard url', () => {
	test('when jwt.sign throws an error', async () => {
		spyOnJwtSign.mockImplementation(() => {
			throw new Error('JWT signing error');
		});

		expect(() => metabaseClientImp.getEmbedDashboardUrl(dashboard, preFilters)).toThrow(
			'JWT signing error'
		);
	});
});
