import { UserAttributes } from '../types/userAttributes';

export class GetDashboardRequest {
	private _userAttributes: UserAttributes;

	constructor(userAttributes: UserAttributes) {
		this._userAttributes = userAttributes;
	}

	public get userAttributes(): UserAttributes {
		return this._userAttributes;
	}

	public validate(): void {}
}
