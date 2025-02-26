import { SQSEvent } from "aws-lambda";
import { UpdateComplaintsListUseCase } from "../../../../domain/useCases/updateComplaintsList";
import { EventComplaintsExtractionMetadataRepositoryImp } from "../../../output/database/eventComplaintsExtractionMetadataRepositoryImp";
import { FileManagementClientImp } from "../../../output/file/fileManagementClient";
import { ComplaintsDataExtractorClientImp } from "../../../output/http/complaintsDataExtractorClientImp";
import { UpdateComplaintsListUseCaseInput } from "../../../../domain/useCases/updateComplaintsList/input";

const eventComplaintsExtractionMetadataRepository = new EventComplaintsExtractionMetadataRepositoryImp();
const complaintsDataExtractorClient = new ComplaintsDataExtractorClientImp();
const fileManagementClient = new FileManagementClientImp();
const updateComplaintsListUseCase = new UpdateComplaintsListUseCase(
  eventComplaintsExtractionMetadataRepository,
  complaintsDataExtractorClient,
  fileManagementClient
);

export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    const { accessToken } = JSON.parse(record.body);

    const usecaseInput: UpdateComplaintsListUseCaseInput = {
      accessToken,
    };

    await updateComplaintsListUseCase.execute(usecaseInput);
  }
};
