import { SQSEvent } from 'aws-lambda';
import { TriggerLinkedInProfileExtractionUseCase } from '../../../../domain/useCases/triggerLinkedInProfileExtraction';
import { EventExtractLinkedinRepositoryImp } from '../../../output/database/eventExtractLinkedinRepositoryImp';
import { LinkedinExtractorClientImp } from '../../../output/http/linkedinExtractorClientImp';
import { sqsEventBody } from './input';
import { TriggerLinkedInProfileExtractionUseCaseInput } from '../../../../domain/useCases/triggerLinkedInProfileExtraction/input';

const repository = new EventExtractLinkedinRepositoryImp();
const linkedinExtractorClient = new LinkedinExtractorClientImp();
const useCase = new TriggerLinkedInProfileExtractionUseCase(linkedinExtractorClient, repository);

export const handler = async (event: SQSEvent): Promise<void> => {
	for (const record of event.Records) {
		const { name } = JSON.parse(record.body) as sqsEventBody;

		const useCaseInput: TriggerLinkedInProfileExtractionUseCaseInput = {
			name
		};

		await useCase.execute(useCaseInput); // TODO - this use case is not implemented yet, but are going to be implemented in the next steps
	}
};
