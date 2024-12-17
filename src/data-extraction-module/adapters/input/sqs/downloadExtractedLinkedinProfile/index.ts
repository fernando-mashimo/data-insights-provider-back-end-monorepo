import { SQSEvent } from 'aws-lambda';
import { DownloadLinkedinProfileUseCase } from '../../../../domain/useCases/downloadLinkedinProfile';
import { LinkedinExtractorClientImp } from '../../../output/http/linkedinExtractorClientImp';
import { EventExtractLinkedinRepositoryImp } from '../../../output/database/eventExtractLinkedinRepositoryImp';
import { FileManagementClientImp } from '../../../output/file/fileManagementClient';
import { DownloadLinkedinProfileUseCaseInput } from '../../../../domain/useCases/downloadLinkedinProfile/input';
import { EventExtractLinkedinStatus } from '../../../../domain/entities/eventExtractLinkedin';
import { sqsEventBody } from './input';

const linkedinExtractorClient = new LinkedinExtractorClientImp();
const repository = new EventExtractLinkedinRepositoryImp();
const fileManager = new FileManagementClientImp();
const useCase = new DownloadLinkedinProfileUseCase(
	linkedinExtractorClient,
	repository,
	fileManager
);

export const handler = async (event: SQSEvent): Promise<void> => {
	for (const record of event.Records) {
		const { snapshot_id, status, error } = JSON.parse(record.body) as sqsEventBody;
		const useCaseInput: DownloadLinkedinProfileUseCaseInput = {
			snapshotId: snapshot_id,
			extractionStatus:
				status !== 'ready' ? EventExtractLinkedinStatus.ERROR : EventExtractLinkedinStatus.FINISHED,
			error: error
		};

		await useCase.execute(useCaseInput); // TODO - this use case is not implemented yet, but are going to be implemented in the next steps
	}
};
