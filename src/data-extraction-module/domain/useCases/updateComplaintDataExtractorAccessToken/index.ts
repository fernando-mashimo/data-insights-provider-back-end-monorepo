import { TokenNotFound } from '../../errors/tokenNotFound';
import { ComplaintsDataExtractorTokenRepository } from '../../repositories/complaintsDataExtractorTokenRepository';
import { ComplaintsDataExtractorClient } from '../../services/complaintsDataExtractorClient';
import { DataEncryptionClient } from '../../services/dataEncryptionClient';
import { UseCase } from '../UseCase';
import { UpdateComplaintDataExtractorAccessTokenUseCaseInput } from './input';

export class UpdateComplaintDataExtractorAccessTokenUseCase
	implements UseCase<UpdateComplaintDataExtractorAccessTokenUseCaseInput, void>
{
	private complaintsDataExtractorTokenRepository: ComplaintsDataExtractorTokenRepository;
	private complaintsDataExtractorClient: ComplaintsDataExtractorClient;
	private dataEncryptionClient: DataEncryptionClient;

	constructor(
		complaintsDataExtractorTokenRepository: ComplaintsDataExtractorTokenRepository,
		complaintsDataExtractorClient: ComplaintsDataExtractorClient,
		dataEncryptionClient: DataEncryptionClient
	) {
		this.complaintsDataExtractorTokenRepository = complaintsDataExtractorTokenRepository;
		this.complaintsDataExtractorClient = complaintsDataExtractorClient;
		this.dataEncryptionClient = dataEncryptionClient;
	}

	public async execute(input?: UpdateComplaintDataExtractorAccessTokenUseCaseInput): Promise<void> {
		if (input && input.cnpj && input.refreshToken) {
			console.info(`Updating access token for CNPJ ${input.cnpj}`);
			try {
				const [token] = await this.complaintsDataExtractorTokenRepository.getByCnpj(input.cnpj);

				if (!token) throw new TokenNotFound(input.cnpj);

				const accessToken = await this.complaintsDataExtractorClient.getAccessToken(
					input.refreshToken
				);

				token.refreshToken = this.dataEncryptionClient.encrypt(input.refreshToken);
				token.accessToken = this.dataEncryptionClient.encrypt(accessToken);
				token.updatedAt = new Date();
				await this.complaintsDataExtractorTokenRepository.put(token);

				return;
			} catch (error) {
				console.error(`Cannot update access token for CNPJ ${input.cnpj}`, error);
				throw error;
			}
		}

		try {
			console.info('Updating access token for existing company tokens');
			const allCompaniesTokens =
				await this.complaintsDataExtractorTokenRepository.getAllCompaniesTokens();
			for (const token of allCompaniesTokens) {
				const decryptedRefreshToken = this.dataEncryptionClient.decrypt(token.refreshToken);
				const accessToken =
					await this.complaintsDataExtractorClient.getAccessToken(decryptedRefreshToken);

				token.accessToken = this.dataEncryptionClient.encrypt(accessToken);
				token.updatedAt = new Date();
				await this.complaintsDataExtractorTokenRepository.put(token);
			}
		} catch (error) {
			console.error('Cannot update access token for all companies', error);
			throw error;
		}
	}
}
