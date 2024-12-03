import { ApiGatewayBaseEvent } from '../../../../../../../test/mock/input/event';
import { UnauthorizedError } from '../../../../../domain/errors/unauthorizedError';
import { GetEmbedUrlUseCase } from '../../../../../domain/useCases/getEmbedUrl/index';
import { HttpAuth } from '../../../helpers/httpAuth';
import { LambdaHttpResponse } from '../../../helpers/httpResponse';
import { handler } from '../index';

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
      email: 'any_email'
    };
  });

  jest.spyOn(GetEmbedUrlUseCase.prototype, 'execute').mockImplementation(() =>
    Promise.resolve({
      url: 'http://bi.isdelta.com/embed/dashboard/any_token#bordered=true&titled=true'
    })
  );
});

describe('Should return url', () => {
	test('when provided inputs are valid', async () => {
		const result = await handler(baseEvent);

		expect(result).toEqual(
			LambdaHttpResponse.success({
				url: 'http://bi.isdelta.com/embed/dashboard/any_token#bordered=true&titled=true'
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

	test('when token is not provided as value of the request header authorization attribute', async () => {
		jest.spyOn(HttpAuth, 'parseLoggedInUser').mockImplementation(() => {
			throw new UnauthorizedError('No token provided');
		});

		const result = await handler(baseEvent);

		expect(result).toEqual(LambdaHttpResponse.error(401, 'UNAUTHORIZED', 'No token provided'));
	});
});
