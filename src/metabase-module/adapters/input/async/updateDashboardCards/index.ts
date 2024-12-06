import { UpdateDashboardCardsUseCase } from '../../../../domain/useCases/updateDashboardCards';
import { MetabaseClientImp } from '../../../output/http/MetabaseClientImp';

const metabaseClient = new MetabaseClientImp();
const useCase = new UpdateDashboardCardsUseCase(metabaseClient);

export const handler = async (): Promise<void> => {
	try {
    await useCase.execute();
	} catch (error) {
		console.error("Cannot handle update dashboard cards async event", error);
    throw error;
	}
};
