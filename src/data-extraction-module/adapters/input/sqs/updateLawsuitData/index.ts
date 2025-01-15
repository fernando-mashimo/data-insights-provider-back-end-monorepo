import { SQSEvent } from "aws-lambda";
import { UpdateLawsuitDataUseCase } from "../../../../domain/useCases/updateLawsuitData";
import { LawsuitDataUpdateClientImp } from "../../../output/http/lawsuitUpdateClientImp";
import { EventUpdateLawsuitRepositoryImp } from "../../../output/database/eventUpdateLawsuitRepositoryImp";
import { FileManagementClientImp } from "../../../output/file/fileManagementClient";
import { UpdateLawsuitDataUseCaseInput } from "../../../../domain/useCases/updateLawsuitData/input";
import { sqsEventBody } from "./input";

const useCase = new UpdateLawsuitDataUseCase(
  new LawsuitDataUpdateClientImp(),
  new FileManagementClientImp(),
  new EventUpdateLawsuitRepositoryImp()
);

export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    const { cnj } = JSON.parse(record.body) as sqsEventBody;

    const useCaseInput: UpdateLawsuitDataUseCaseInput = {
      cnj
    };

    await useCase.execute(useCaseInput);
  }
};
