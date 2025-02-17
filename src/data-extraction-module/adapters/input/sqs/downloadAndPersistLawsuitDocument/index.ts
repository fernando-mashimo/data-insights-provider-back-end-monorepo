import { SQSEvent } from 'aws-lambda';
import { DownloadAndPersistLawsuitDocumentUseCase } from '../../../../domain/useCases/downloadAndPersistLawsuitDocument';
import { EventDownloadAndPersistLawsuitDocumentRepositoryImp } from '../../../output/database/eventDownloadAndPersistLawsuitDocumentRepositoryImp';
import { FileManagementClientImp } from '../../../output/file/fileManagementClient';
import { LawsuitDataExtractorClientImp } from '../../../output/http/lawsuitDataExtractorClientImp';
import { sqsEventBody } from './input';
import { DownloadAndPersistLawsuitDocumentUseCaseInput } from '../../../../domain/useCases/downloadAndPersistLawsuitDocument/input';

const eventDownloadAndPersistLawsuitDOcumentRepository =
	new EventDownloadAndPersistLawsuitDocumentRepositoryImp();
const lawsuitDataExtractorClient = new LawsuitDataExtractorClientImp();
const fileManagementClient = new FileManagementClientImp();
const downloadAndPersistLawsuitDocumentUseCase = new DownloadAndPersistLawsuitDocumentUseCase(
	eventDownloadAndPersistLawsuitDOcumentRepository,
	lawsuitDataExtractorClient,
	fileManagementClient
);

export const handler = async (event: SQSEvent): Promise<void> => {
	for (const record of event.Records) {
		const { cnj, externalId, documentUrl }: sqsEventBody = JSON.parse(record.body);

    const cleanCnj = cnj.replace(/\D/g, '');

		const useCaseInput: DownloadAndPersistLawsuitDocumentUseCaseInput = {
			cnj: cleanCnj,
			externalId,
			documentUrl
		};

		await downloadAndPersistLawsuitDocumentUseCase.execute(useCaseInput);
	}
};
