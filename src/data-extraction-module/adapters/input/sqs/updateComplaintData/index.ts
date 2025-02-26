import { SQSEvent } from 'aws-lambda';
import { UpdateComplaintDataUseCase } from '../../../../domain/useCases/updateComplaintData';
import { UpdateComplaintDataUseCaseInput } from '../../../../domain/useCases/updateComplaintData/input';
import { EventUpdateComplaintDataRepositoryImp } from '../../../output/database/eventUpdateComplaintDataRepositoryImp';
import { FileManagementClientImp } from '../../../output/file/fileManagementClient';
import { ComplaintsDataExtractorClientImp } from '../../../output/http/complaintsDataExtractorClientImp';
import { sqsEventBody } from './input';

const eventUpdateComplaintDataRepository = new EventUpdateComplaintDataRepositoryImp();
const complaintsDataExtractorClient = new ComplaintsDataExtractorClientImp();
const fileManagementClient = new FileManagementClientImp();
const updateComplaintDataUseCase = new UpdateComplaintDataUseCase(
	eventUpdateComplaintDataRepository,
	complaintsDataExtractorClient,
	fileManagementClient
);

export const handler = async (event: SQSEvent): Promise<void> => {
	for (const record of event.Records) {
		const { complaintExternalId, accessToken } = JSON.parse(record.body) as sqsEventBody;

		const usecaseInput: UpdateComplaintDataUseCaseInput = {
			complaintExternalId,
			accessToken
		};

		await updateComplaintDataUseCase.execute(usecaseInput);
	}
};
