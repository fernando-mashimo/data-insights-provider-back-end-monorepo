import { UseCase } from '../../../common/interfaces/useCase';
import { SsoUseCaseInput } from './input';
import { SsoUseCaseOutput } from './output';
import { IDataDisplayManager } from '../services/dataDisplayManager';

export class SsoUseCase implements UseCase<SsoUseCaseInput, SsoUseCaseOutput> {
	private dataDisplayManager: IDataDisplayManager;

	constructor(dataDisplayManager: IDataDisplayManager) {
		this.dataDisplayManager = dataDisplayManager;
	}

	public async execute(userAttributes: SsoUseCaseInput): Promise<SsoUseCaseOutput> {
		try {
			const dashboardUrl = this.dataDisplayManager.getDashboardUrl(userAttributes);

			return {
				url: dashboardUrl
			};
		} catch (error) {
			console.error(`Cannot SSO with input ${JSON.stringify(userAttributes)}`, error);
			throw error;
		}
	}
}
