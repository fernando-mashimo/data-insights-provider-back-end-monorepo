import { Dashboard } from './Dashboard';

export class LoggedInUser {
	constructor(
		public readonly id: string,
		public readonly email: string,
		public readonly companyName?: string,
		public readonly companyCnpj?: string,
		public readonly allowedDashboards: Dashboard[] = []
	) {}
}
