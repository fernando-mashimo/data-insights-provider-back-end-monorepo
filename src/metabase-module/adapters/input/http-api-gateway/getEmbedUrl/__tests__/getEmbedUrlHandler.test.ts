import { ApiGatewayBaseEvent } from '../../../../../../../test/mock/input/event';
import { Dashboard } from '../../../../../domain/entities/Dashboard';
import { ForbiddenError } from '../../../../../domain/errors/forbidenError';
import { UnauthorizedError } from '../../../../../domain/errors/unauthorizedError';
import { GetEmbedUrlUseCase } from '../../../../../domain/useCases/getEmbedUrl/index';
import { HttpAuth } from '../../../helpers/http/httpAuth';
import { LambdaHttpResponse } from '../../../helpers/http/httpResponse';
import { handler } from '../index';
import { requestBody } from '../input';

const baseEvent = {
	...ApiGatewayBaseEvent,
	headers: {
		Authorization: 'Bearer token'
	}
};

beforeEach(() => {
	jest.restoreAllMocks();

	jest.spyOn(HttpAuth, 'parseLoggedInUser').mockImplementation(() => {
		return {
			id: 'any_id',
			email: 'any_email',
			companyName: 'any_company_name',
			companyCnpj: 'any_company_cnpj',
			allowedDashboards: [Dashboard.TEST]
		};
	});

	jest.spyOn(GetEmbedUrlUseCase.prototype, 'execute').mockImplementation(() =>
		Promise.resolve({
			url: 'http://bi.isdelta.com/embed/dashboard/any_token'
		})
	);
});

describe('Should return url', () => {
	test('when provided inputs are valid', async () => {
		const body: requestBody = {
			dashboard: Dashboard.TEST
		};

		const event = structuredClone(baseEvent);
		event.body = JSON.stringify(body);

		const result = await handler(event);

		expect(result).toEqual(
			LambdaHttpResponse.success({
				url: 'http://bi.isdelta.com/embed/dashboard/any_token'
			})
		);
	});
});

describe('Should not return url', () => {
	test('when request header authorization attribute is not provided', async () => {
		jest.spyOn(HttpAuth, 'parseLoggedInUser').mockImplementation(() => {
			throw new UnauthorizedError('No authorization header provided');
		});

		const result = await handler(baseEvent);

		expect(result).toEqual(
			LambdaHttpResponse.error(401, 'UNAUTHORIZED', 'No authorization header provided')
		);
	});

	test('when request body is not provided', async () => {
		const result = await handler(baseEvent);

		expect(result).toEqual(
			LambdaHttpResponse.error(400, 'BAD_REQUEST', 'Invalid body shape provided')
		);
	});

	test('when token is not provided as value of the request header authorization attribute', async () => {
		jest.spyOn(HttpAuth, 'parseLoggedInUser').mockImplementation(() => {
			throw new UnauthorizedError('No token provided');
		});

		const result = await handler(baseEvent);

		expect(result).toEqual(LambdaHttpResponse.error(401, 'UNAUTHORIZED', 'No token provided'));
	});

	test('when user does not have permission to access the dashboard', async () => {
		jest.spyOn(GetEmbedUrlUseCase.prototype, 'execute').mockImplementation(() => {
			throw new ForbiddenError(
				'Dashboard any_dashboard is not allowed for logged in user any_email'
			);
		});

		const body: requestBody = {
			dashboard: Dashboard.TEST
		};

		const event = structuredClone(baseEvent);
		event.body = JSON.stringify(body);

		const result = await handler(event);

		expect(result).toEqual(
			LambdaHttpResponse.error(
				403,
				'FORBIDDEN',
				'Dashboard any_dashboard is not allowed for logged in user any_email'
			)
		);
	});
});
