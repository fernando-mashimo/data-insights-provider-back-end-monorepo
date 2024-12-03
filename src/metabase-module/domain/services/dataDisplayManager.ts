import { UserAttributes } from '../../adapters/input/types/userAttributes';

export interface IDataDisplayManager {
	getDashboardUrl(userAttributes: UserAttributes): string;
}
