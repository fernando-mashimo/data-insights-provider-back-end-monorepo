import { Dashboard } from '../../entities/Dashboard';
import { LoggedInUser } from '../../entities/LoggedInUser';

export type GetEmbedUrlUseCaseInput = {
	loggedInUser: LoggedInUser;
	dashboard: Dashboard;
};
