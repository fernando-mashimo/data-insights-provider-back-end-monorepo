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
		const { cnj, courtState } = JSON.parse(record.body) as sqsEventBody;

		if (!allowedStates.includes(courtState))
			throw new Error(`Invalid state provided: ${courtState}`);

		const useCaseInput: TriggerExtractLawsuitDocumentAsyncUseCaseInput = {
			cnj,
			courtState
		};

		await triggerExtractLawsuitDocumentAsyncUseCase.execute(useCaseInput);
	}
};

const allowedStates = [
	'AC',
	'AL',
	'AP',
	'AM',
	'BA',
	'CE',
	'DF',
	'ES',
	'GO',
	'MA',
	'MT',
	'MS',
	'MG',
	'PA',
	'PB',
	'PR',
	'PE',
	'PI',
	'RJ',
	'RN',
	'RS',
	'RO',
	'RR',
	'SC',
	'SP',
	'SE',
	'TO'
];
