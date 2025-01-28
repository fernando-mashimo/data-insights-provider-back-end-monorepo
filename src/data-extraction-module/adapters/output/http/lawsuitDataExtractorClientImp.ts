import { $config } from '$config';
import axios, { Axios, AxiosError } from 'axios';
import {
	GetMonitoredTermResponse,
	CreateTermMonitoringBody,
	LawsuitDataExtractionResponse,
	LawsuitDataExtractorClient,
	MonitoredTerm
} from '../../../domain/services/lawsuitDataExtractorClient';

export class LawsuitDataExtractorClientImp implements LawsuitDataExtractorClient {
	private client: Axios;
	private pageSize: number = 50;

	constructor() {
		this.client = axios.create({
			timeout: $config.AXIOS_REQUEST_TIMEOUT_SECONDS * 1000
		});
	}

	public async getLawsuits(
		cnpj: string,
		nextPageUrl?: string | null
	): Promise<LawsuitDataExtractionResponse> {
		let url;

		if (nextPageUrl) {
			url = nextPageUrl;
		} else {
			url = new URL($config.ESCAVADOR_API_URL);
			url.pathname = 'api/v2/envolvido/processos';
			url.searchParams.append('cpf_cnpj', cnpj);
			url.searchParams.append('limit', this.pageSize.toString());
		}

		const headers = {
			Authorization: `Bearer ${$config.ESCAVADOR_API_KEY}`
		};

    try {
      const { data } = await this.client.get(url.toString(), { headers });

      const {
        items,
        links,
        envolvido_encontrado: { quantidade_processos }
      } = data;

      const totalPages = Math.ceil(quantidade_processos / this.pageSize);

      return {
        lawsuits: items,
        hasNext: !!links.next,
        totalPages,
        nextPageUrl: links.next
      };
    } catch (error) {
      console.error(`Error extracting lawsuit data for CNPJ ${cnpj}`);
      if (error instanceof AxiosError) {
        if (error.status === 422) throw new Error('Invalid CNPJ format');
      }
      throw error;
    }
	}

	public async verifyIfTermIsAlreadyMonitored(term: string): Promise<boolean> {
		const url = new URL($config.ESCAVADOR_API_URL);
		url.pathname = 'api/v2/monitoramentos/novos-processos';

		const headers = {
			Authorization: `Bearer ${$config.ESCAVADOR_API_KEY}`
		};

		const { data } = await this.client.get(url.toString(), { headers });

		if (!data.items || data.items.length === 0) return false;

		const items = data.items as GetMonitoredTermResponse[];

		const monitoredTerms = items.flatMap((item: GetMonitoredTermResponse) => [
			item.termo,
			...item.variacoes
		]);

		return monitoredTerms.includes(term);
	}

	public async createTermMonitoring(term: string): Promise<MonitoredTerm> {
		const url = new URL($config.ESCAVADOR_API_URL);
		url.pathname = 'api/v2/monitoramentos/novos-processos';

		const headers = {
			Authorization: `Bearer ${$config.ESCAVADOR_API_KEY}`
		};

		const payload: CreateTermMonitoringBody = {
			termo: term,
			variacoes: [term.replace(/\D/g, '')]
		};

		const { data } = await this.client.post(url.toString(), payload, { headers });

		return {
			term: data.termo,
			variationTerm: data.variacoes[0],
			externalId: data.id.toString()
		};
	}
}
