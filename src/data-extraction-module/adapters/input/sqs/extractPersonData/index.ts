import { SQSEvent } from 'aws-lambda';
import { ExtractPersonDataUseCaseInput } from '../../../../domain/useCases/extractPersonData/input';
import { sqsEventBody } from './input';
import { ExtractPersonDataUseCase } from '../../../../domain/useCases/extractPersonData';
import { EventExtractPersonDataRepositoryImp } from '../../../output/database/eventExtractPersonDataRepositoryImp';
import { FileManagementClientImp } from '../../../output/file/fileManagementClient';
import { PersonDataExtractorClientImp } from '../../../output/http/personDataExtractorClientImp';

const useCase = new ExtractPersonDataUseCase(
  new EventExtractPersonDataRepositoryImp(),
  new PersonDataExtractorClientImp(),
  new FileManagementClientImp()
);

export const handler = async (event: SQSEvent): Promise<void> => {
	for (const record of event.Records) {
		const { cpf } = JSON.parse(record.body) as sqsEventBody;

		const useCaseInput: ExtractPersonDataUseCaseInput = { cpf };

    await useCase.execute(useCaseInput);
	}
};
