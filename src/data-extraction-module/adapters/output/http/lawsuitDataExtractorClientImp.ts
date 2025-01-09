import { $config } from '$config';
import axios, { Axios } from 'axios';
import {
	GenericExtractedData,
	LawsuitDataExtractionResponse,
	LawsuitDataExtractorClient,
	LawsuitTimelineDataExtractionResponse
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

		const { data } = await this.client.get(url.toString(), { headers });

		const { items, links, envolvido_encontrado: { quantidade_processos } } = data;

    const totalPages = Math.ceil(quantidade_processos / this.pageSize);

		return {
			lawsuits: items,
			hasNext: !!links.next,
      totalPages,
			nextPageUrl: links.next
		};
	}

	public async getLawsuitTimeline(
		lawsuit: GenericExtractedData,
		nextPageUrl?: string | null
	): Promise<LawsuitTimelineDataExtractionResponse> {
		const lawsuitNumber = lawsuit.numero_cnj;
		let url: URL;

		if (nextPageUrl) {
			url = new URL(nextPageUrl);
		} else {
			url = new URL($config.ESCAVADOR_API_URL);
			url.pathname = `processos/numero_cnj/${lawsuitNumber}/movimentacoes`;
			url.searchParams.append('limit', this.pageSize.toString());
		}

		const headers = {
			Authorization: `Bearer ${$config.ESCAVADOR_API_KEY}`
		};

		const { data } = await this.client.get(url.toString(), { headers });

		const { items, links } = data;

		return {
			timeline: items,
			hasNext: !!links.next,
			nextPageUrl: links.next
		};
	}
}
