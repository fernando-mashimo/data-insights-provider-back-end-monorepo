import axios, { Axios, AxiosError } from 'axios';
import {
	GenericExtractedData,
	GetDataRequestBody,
	PersonDataExtractorClient
} from '../../../domain/services/personDataExtractorClient';
import { $config } from '$config';

export class PersonDataExtractorClientImp implements PersonDataExtractorClient {
	private client: Axios;

	constructor() {
		this.client = axios.create({
			timeout: $config.AXIOS_REQUEST_TIMEOUT_SECONDS * 1000
		});
	}

	private async getPersonData(body: GetDataRequestBody): Promise<GenericExtractedData> {
		const url = new URL($config.BIG_DATA_CORP_API_URL);
		url.pathname = 'pessoas';

		const headers = {
			AccessToken: $config.BIG_DATA_CORP_API_ACCESS_TOKEN,
			TokenId: $config.BIG_DATA_CORP_API_TOKEN_ID
		};

		try {
			const { data } = await this.client.post(url.toString(), body, { headers });

			return data;
		} catch (error) {
			console.error('Error extracting person data');
			if (error instanceof AxiosError) {
				if (error.response && error.response.status < 500)
					throw new Error('Some error ocurred - verify input data');
				if (error.status && error.status >= 500) throw new Error('Internal server error');
			}
			throw error;
		}
	}

	public async getBasicData(cpf: string): Promise<GenericExtractedData> {
		const body: GetDataRequestBody = {
			Datasets: 'basic_data',
			q: `doc{${cpf}}`
		};

    return await this.getPersonData(body);
	}

	public async getFinancialData(cpf: string): Promise<GenericExtractedData> {
		const body: GetDataRequestBody = {
			Datasets: 'financial_risk',
			q: `doc{${cpf}}`
		};

		return await this.getPersonData(body);
	}

	public async getLawsuitsData(cpf: string): Promise<GenericExtractedData> {
		const body: GetDataRequestBody = {
			Datasets: 'processes',
			q: `doc{${cpf}}`
		};

		return await this.getPersonData(body);
	}
}
