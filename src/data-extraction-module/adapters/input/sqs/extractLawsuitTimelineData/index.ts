import { SQSEvent } from "aws-lambda";
import { ExtractLawsuitTimelineDataUseCase } from "../../../../domain/useCases/extractLawsuitTimelineData";
import { EventExtractLawsuitTimelineRepositoryImp } from "../../../output/database/eventExtractLawsuitTimelineRepositoryImp";
import { FileManagementClientImp } from "../../../output/file/fileManagementClient";
import { LawsuitTimelineDataExtractorClientImp } from "../../../output/http/lawsuitTimelineDataExtractorClientImp";
import { sqsEventBody } from "./input";
import { ExtractLawsuitTimelineDataUseCaseInput } from "../../../../domain/useCases/extractLawsuitTimelineData/input";

const useCase = new ExtractLawsuitTimelineDataUseCase(
  new LawsuitTimelineDataExtractorClientImp(),
  new FileManagementClientImp(),
  new EventExtractLawsuitTimelineRepositoryImp()
);

export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    const { cnj } = JSON.parse(record.body) as sqsEventBody;

    const useCaseInput: ExtractLawsuitTimelineDataUseCaseInput = {
      cnj
    };

    await useCase.execute(useCaseInput);
  }
};
