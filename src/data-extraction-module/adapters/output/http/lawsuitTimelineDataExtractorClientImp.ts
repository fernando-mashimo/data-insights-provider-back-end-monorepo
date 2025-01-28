import { $config } from '$config';
import axios, { Axios, AxiosError } from 'axios';
import {
	LawsuitTimelineDataExtractionResponse,
	LawsuitTimelineDataExtractorClient
} from '../../../domain/services/lawsuitTimelineDataExtractorClient';

export class LawsuitTimelineDataExtractorClientImp implements LawsuitTimelineDataExtractorClient {
	private client: Axios;
	private pageSize: number = 50;

	constructor() {
		this.client = axios.create({
			timeout: $config.AXIOS_REQUEST_TIMEOUT_SECONDS * 1000
		});
	}

	public async getLawsuitTimeline(
		cnj: string,
		nextPageUrl?: string | null
	): Promise<LawsuitTimelineDataExtractionResponse> {
		let url;

		if (nextPageUrl) {
			url = nextPageUrl;
		} else {
			url = new URL($config.ESCAVADOR_API_URL);
			url.pathname = `api/v2/processos/numero_cnj/${cnj}/movimentacoes`;
			url.searchParams.append('limit', this.pageSize.toString());
		}

		const headers = {
			Authorization: `Bearer ${$config.ESCAVADOR_API_KEY}`
		};

		try {
			const { data } = await this.client.get(url.toString(), { headers });

			const { items, links } = data;

			return {
				timeline: items,
				hasNext: !!links.next,
				nextPageUrl: links.next
			};
		} catch (error) {
			console.error(`Error extracting lawsuit timeline data for CNJ ${cnj}`);
			if (error instanceof AxiosError) {
				if (error.status === 404) throw new Error('Lawsuit timeline not found at Escavador');
				if (error.status === 422) throw new Error('Invalid CNJ format');
			}
			throw error;
		}
	}
}
