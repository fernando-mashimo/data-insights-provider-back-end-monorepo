import { IDataDisplayManager } from '../../../domain/services/dataDisplayManager';
import { UserAttributes } from '../../input/types/userAttributes';
import * as jwt from 'jsonwebtoken';
import { $config } from '../../../../config';

export class DataDisplayManager implements IDataDisplayManager {
	public getDashboardUrl(userAttributes: UserAttributes): string {
		try {
      // To be implemented when the actual logic with dashboard parameters is known
			// const dashboardParams = Object.keys(userAttributes)
			// 	.filter((key) => key.startsWith('custom:'))
			// 	.reduce((params: { [key: string]: any }, key: string) => {
			// 		params[key.split('custom:')[1]] = userAttributes[key as keyof UserAttributes];
			// 		return params;
			// 	}, {});

			const payload = {
				resource: { dashboard: 1 },
				params: {},
				exp: Math.round(Date.now() / 1000) + $config.EXTERNAL_DATA_API_TOKEN_EXPIRATION_MINUTES * 60
			};
			const externalDataApiToken = jwt.sign(payload, $config.EXTERNAL_DATA_API_KEY);

			return `${$config.EXTERNAL_DATA_API_URL}/embed/dashboard/${externalDataApiToken}#bordered=true&titled=true`;
		} catch (error) {
			console.error(
				`Cannot get dashboard url in data display manager with userAttributes ${userAttributes}`,
				error
			);
			throw error;
		}
	}
}
