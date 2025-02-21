import { ComplaintsDataExtractorToken } from '../entities/complaintsDataExtractorToken';

export interface ComplaintsDataExtractorTokenRepository {
	getByCnpj(cnpj: string): Promise<ComplaintsDataExtractorToken[]>;
	getAllCompaniesTokens(): Promise<ComplaintsDataExtractorToken[]>;
	put(token: ComplaintsDataExtractorToken): Promise<void>;
}
