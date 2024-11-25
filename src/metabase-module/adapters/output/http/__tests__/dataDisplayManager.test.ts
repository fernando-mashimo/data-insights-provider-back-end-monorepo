import { DataDisplayManager } from '../dataDisplayManager';
import { $config } from '../../../../../config';
import * as jwt from 'jsonwebtoken';

const dataDisplayManager = new DataDisplayManager();

$config.EXTERNAL_DATA_API_URL = 'http://bi.isdelta.com';
$config.EXTERNAL_DATA_API_KEY = 'any_key';
$config.EXTERNAL_DATA_API_TOKEN_EXPIRATION_MINUTES = 60;

describe('Should return a dashboard url', () => {
	test('when provided userAttributes are valid', async () => {
		const userAttributes = {
			'custom:dashboard_id': 1,
			'custom:company_name': 'IsDelta'
		};

		const spyOnJwtSign = jest.spyOn(jwt, 'sign').mockImplementation(() => 'any_token');

		const result = dataDisplayManager.getDashboardUrl(userAttributes);

		expect(result).toEqual(
			'http://bi.isdelta.com/embed/dashboard/any_token#bordered=true&titled=true'
		);
		expect(spyOnJwtSign).toHaveBeenCalledWith(
			expect.objectContaining({
				resource: { dashboard: 1 },
				params: { company_name: 'IsDelta' },
				exp: expect.any(Number)
			}),
			'any_key'
		);
	});
});

describe('Should not return a dashboard url', () => {
	test('when jwt.sign throws an error', async () => {
		const userAttributes = {
			'custom:dashboard_id': 1,
			'custom:company_name': 'IsDelta'
		};

		jest.spyOn(jwt, 'sign').mockImplementation(() => {
			throw new Error('JWT signing error');
		});

		expect(() => dataDisplayManager.getDashboardUrl(userAttributes)).toThrow('JWT signing error');

		jest.restoreAllMocks();
	});
});
