import { SQSEvent } from 'aws-lambda';
import { UpdateComplaintDataExtractorAccessTokenUseCase } from '../../../../domain/useCases/updateComplaintDataExtractorAccessToken';
import { ReclameAquiTokenEncryptionClientImp } from '../../../helpers/crypto/reclameAquiDataEncryption/reclameAquiTokenEncryptionClientImp';
import { ComplaintsDataExtractorTokenRepositoryImp } from '../../../output/database/complaintsDataExtractorTokenRepositoryImp';
import { ComplaintsDataExtractorClientImp } from '../../../output/http/complaintsDataExtractorClientImp';
import { sqsEventBody } from './input';
import { UpdateComplaintDataExtractorAccessTokenUseCaseInput } from '../../../../domain/useCases/updateComplaintDataExtractorAccessToken/input';

const complaintsDataExtractorTokenRepository = new ComplaintsDataExtractorTokenRepositoryImp();
const complaintsDataExtractorClient = new ComplaintsDataExtractorClientImp();
const dataEncryptionClient = new ReclameAquiTokenEncryptionClientImp();
const updateAccessTokenUseCase = new UpdateComplaintDataExtractorAccessTokenUseCase(
	complaintsDataExtractorTokenRepository,
	complaintsDataExtractorClient,
	dataEncryptionClient
);

export const handler = async (event: SQSEvent | undefined): Promise<void> => {
	if (event && event.Records) {
		for (const record of event.Records) {
			const { cnpj, refreshToken } = JSON.parse(record.body) as sqsEventBody;
			const cleanCnpj = cnpj.replace(/\D/g, '');

			const useCaseInput: UpdateComplaintDataExtractorAccessTokenUseCaseInput = {
				cnpj: cleanCnpj,
				refreshToken
			};

			await updateAccessTokenUseCase.execute(useCaseInput);
		}
		return;
	}

	await updateAccessTokenUseCase.execute();
};
