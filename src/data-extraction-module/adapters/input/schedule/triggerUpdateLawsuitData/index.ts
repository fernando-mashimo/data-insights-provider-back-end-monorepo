import { TriggerUpdateLawsuitDataUseCase } from "../../../../domain/useCases/triggerUpdateLawsuitData";
import { LawsuitDataUpdateClientImp } from "../../../output/http/lawsuitUpdateClientImp";
import { LawsuitsDataUpdateQueueImp } from "../../../output/sqs/lawsuitsDataUpdateQueueImp";

const useCase = new TriggerUpdateLawsuitDataUseCase(
  new LawsuitDataUpdateClientImp(),
  new LawsuitsDataUpdateQueueImp()
);

export const handler = async (): Promise<void> => {
  await useCase.execute();
};
