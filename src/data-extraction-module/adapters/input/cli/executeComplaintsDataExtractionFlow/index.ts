import { CreateComplaintsExtractionMetadataUseCase } from '../../../../domain/useCases/createComplaintsExtractionMetadata';
import { EventComplaintsExtractionMetadataRepositoryImp } from '../../../output/database/eventComplaintsExtractionMetadataRepositoryImp';
import { ComplaintsDataExtractorClientImp } from '../../../output/http/complaintsDataExtractorClientImp';
import { CreateComplaintsExtractionMetadataUseCaseInput } from '../../../../domain/useCases/createComplaintsExtractionMetadata/input';
import { UpdateComplaintDataUseCase } from '../../../../domain/useCases/updateComplaintData';
import { UpdateComplaintsListUseCase } from '../../../../domain/useCases/updateComplaintsList';
import { EventUpdateComplaintDataRepositoryImp } from '../../../output/database/eventUpdateComplaintDataRepositoryImp';
import { FileManagementClientImp } from '../../../output/file/fileManagementClient';

const eventComplaintsExtractionMetadataRepository =
	new EventComplaintsExtractionMetadataRepositoryImp();
const complaintsDataExtractorClient = new ComplaintsDataExtractorClientImp();
const fileManagementClient = new FileManagementClientImp();
const eventUpdateComplaintDataRepository = new EventUpdateComplaintDataRepositoryImp();
const updateComplaintDataUseCase = new UpdateComplaintDataUseCase(
	eventUpdateComplaintDataRepository,
	complaintsDataExtractorClient,
	fileManagementClient
);
const updateComplaintsListUseCase = new UpdateComplaintsListUseCase(
	eventComplaintsExtractionMetadataRepository,
	complaintsDataExtractorClient,
	fileManagementClient,
	updateComplaintDataUseCase
);
const createComplaintsExtractionMetadataUseCase = new CreateComplaintsExtractionMetadataUseCase(
	eventComplaintsExtractionMetadataRepository,
	complaintsDataExtractorClient,
	updateComplaintsListUseCase
);

export const handler = async (refreshToken: string): Promise<void> => {
	const usecaseInput: CreateComplaintsExtractionMetadataUseCaseInput = {
		refreshToken
	};

	await createComplaintsExtractionMetadataUseCase.execute(usecaseInput);
};

if (require.main === module) {
	const refreshToken = process.argv[2];

	if (!refreshToken) {
		console.error('Please provide a refresh token');
		process.exit(1);
	}

  try {
    handler(refreshToken);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

// ts-node src/data-extraction-module/adapters/input/cli/executeComplaintsDataExtractionFlows/index.ts <refresh_token>
