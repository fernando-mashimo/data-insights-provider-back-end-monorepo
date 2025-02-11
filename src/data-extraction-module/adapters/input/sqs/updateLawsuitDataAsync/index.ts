import { SQSEvent } from 'aws-lambda';
import { UpdateLawsuitDataAsyncUseCase } from '../../../../domain/useCases/updateLawsuitDataAsync';
import { EventUpdateLawsuitAsyncRepositoryImp } from '../../../output/database/eventUpdateLawsuitAsyncRepositoryImp';
import { LawsuitDataExtractorClientImp } from '../../../output/http/lawsuitDataExtractorClientImp';
import { sqsEventBody } from './input';
import { UpdateLawsuitDataAsyncUseCaseInput } from '../../../../domain/useCases/updateLawsuitDataAsync/input';

const lawsuitDataExtractorClient = new LawsuitDataExtractorClientImp();
const eventUpdateLawsuitAsyncRepository = new EventUpdateLawsuitAsyncRepositoryImp();
const updateLawsuitDataAsyncUseCase = new UpdateLawsuitDataAsyncUseCase(
	lawsuitDataExtractorClient,
	eventUpdateLawsuitAsyncRepository
);

export const handler = async (event: SQSEvent): Promise<void> => {
	for (const record of event.Records) {
		const { cnj } = JSON.parse(record.body) as sqsEventBody;

		const useCaseInput: UpdateLawsuitDataAsyncUseCaseInput = {
			cnj
		};

		await updateLawsuitDataAsyncUseCase.execute(useCaseInput);
	}
};
