import { SQSEvent } from 'aws-lambda';
import { TriggerExtractLawsuitDocumentAsyncUseCase } from '../../../../domain/useCases/triggerExtractLawsuitDocumentAsync';
import { EventExtractLawsuitDocumentAsyncRepositoryImp } from '../../../output/database/eventExtractLawsuitDocumentAsyncRepositoryImp';
import { LawsuitDataExtractorClientImp } from '../../../output/http/lawsuitDataExtractorClientImp';
import { sqsEventBody } from './input';
import { TriggerExtractLawsuitDocumentAsyncUseCaseInput } from '../../../../domain/useCases/triggerExtractLawsuitDocumentAsync/input';

const eventExtractLawsuitDocumentAsyncRepository =
	new EventExtractLawsuitDocumentAsyncRepositoryImp();
const lawsuitDataExtractorClient = new LawsuitDataExtractorClientImp();
const triggerExtractLawsuitDocumentAsyncUseCase = new TriggerExtractLawsuitDocumentAsyncUseCase(
	eventExtractLawsuitDocumentAsyncRepository,
	lawsuitDataExtractorClient
);

export const handler = async (event: SQSEvent): Promise<void> => {
	for (const record of event.Records) {
		const { cnj } = JSON.parse(record.body) as sqsEventBody;
    const cleanCnj = cnj.replace(/\D/g, '');

		const useCaseInput: TriggerExtractLawsuitDocumentAsyncUseCaseInput = {
			cnj: cleanCnj
		};

		await triggerExtractLawsuitDocumentAsyncUseCase.execute(useCaseInput);
	}
};
