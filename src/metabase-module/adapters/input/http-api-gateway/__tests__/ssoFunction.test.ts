import {
	ApiGatewayBaseContext,
	ApiGatewayBaseEvent
} from '../../../../../../test/mock/input/event';
import { SsoUseCase } from '../../../../domain/useCases/ssoUseCase';
import { LambdaHttpResponse } from '../../helpers/httpResponse';
import { handler } from '../ssoFunction';
import { jwtDecode } from 'jwt-decode';

const baseEvent = {
	...ApiGatewayBaseEvent,
	headers: {
		Authorization: 'Bearer token'
	}
};

const baseContext = {
	...ApiGatewayBaseContext
};

jest.mock('jwt-decode');

jest.spyOn(SsoUseCase.prototype, 'execute').mockImplementation(() =>
	Promise.resolve({
		url: 'http://bi.isdelta.com/embed/dashboard/any_token#bordered=true&titled=true'
	})
);

describe('Should return url', () => {
	test('when provided inputs are valid', async () => {
		(jwtDecode as jest.Mock).mockReturnValue({
			'custom:company_name': 'IsDelta'
		});
		const result = await handler(baseEvent, baseContext);

		expect(result).toEqual(
			LambdaHttpResponse.success({
				url: 'http://bi.isdelta.com/embed/dashboard/any_token#bordered=true&titled=true'
			})
		);
	});
});
