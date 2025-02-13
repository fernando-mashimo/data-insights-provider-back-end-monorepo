// import { Dashboard } from '../../../../domain/entities/Dashboard';
import { BadRequestError } from '../../helpers/http/httpErrors';
import { requestBody } from './input';

export function validateBody(body: requestBody): void {
	if (body?.dashboard == undefined) {
		throw new BadRequestError('Missing required field: dashboard');
	}

	if (typeof body.dashboard !== 'number') {
		throw new BadRequestError('Invalid type for field: dashboard must be a number');
	}

	/**
	 * Removed this validation because user can only access dashboards
	 * that are allowed by the system.
	 * This check is redundant, and for while take time to maintain.
	 */
	// const allowedDashboards = Object.values(Dashboard);
	// if (!allowedDashboards.includes(body.dashboard)) {
	// 	throw new BadRequestError(`Invalid value for field: dashboard`);
	// }
}
