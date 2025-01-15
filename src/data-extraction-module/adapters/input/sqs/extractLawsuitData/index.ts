import { SQSEvent } from 'aws-lambda';
import { sqsEventBody } from './input';
import { ExtractLawsuitDataUseCaseInput } from '../../../../domain/useCases/extractLawsuitData/input';
import { ExtractLawsuitDataUseCase } from '../../../../domain/useCases/extractLawsuitData';
import { EventExtractLawsuitRepositoryImp } from '../../../output/database/eventExtractLawsuitRepositoryImp';
import { FileManagementClientImp } from '../../../output/file/fileManagementClient';
import { LawsuitDataExtractorClientImp } from '../../../output/http/lawsuitDataExtractorClientImp';
import { LawsuitsTimelineDataExtractionQueueImp } from '../../../output/sqs/lawsuitsTimelineDataExtractionQueueImp';
import { LawsuitsDataUpdateQueueImp } from '../../../output/sqs/lawsuitsDataUpdateQueueImp';

const useCase = new ExtractLawsuitDataUseCase(
  new LawsuitDataExtractorClientImp(),
  new FileManagementClientImp(),
  new EventExtractLawsuitRepositoryImp(),
  new LawsuitsTimelineDataExtractionQueueImp(),
  new LawsuitsDataUpdateQueueImp()
);

export const handler = async (event: SQSEvent): Promise<void> => {
	for (const record of event.Records) {
		const { cnpj } = JSON.parse(record.body) as sqsEventBody;

    const useCaseInput: ExtractLawsuitDataUseCaseInput = {
      cnpj
    };

    await useCase.execute(useCaseInput);
	}
};
