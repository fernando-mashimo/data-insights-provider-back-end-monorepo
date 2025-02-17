import { $config } from '$config';
import axios, { Axios, AxiosError } from 'axios';
import {
	GetMonitoredTermResponse,
	CreateTermMonitoringBody,
	LawsuitDataExtractionResponse,
	LawsuitDataExtractorClient,
	MonitoredTerm,
	LawsuitUpdateAsyncProcess,
	CreateLawsuitUpdateAsyncProcessBody,
	GenericExtractedData,
	LawsuitDocumentExtractionAsyncProcess
} from '../../../domain/services/lawsuitDataExtractorClient';
import { getCourtCredentialsByCnj } from './helpers/getCourtCredentialsByCnj';

export class LawsuitDataExtractorClientImp implements LawsuitDataExtractorClient {
	private client: Axios;
	private pageSize: number = 50;

	constructor() {
		this.client = axios.create({
			timeout: $config.AXIOS_REQUEST_TIMEOUT_SECONDS * 1000
		});
	}

	public async getLawsuitsByCnpj(
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
				if (error.status && error.status < 500)
					throw new Error('Some error ocurred - verify input data');
				if (error.status && error.status >= 500) throw new Error('Internal server error');
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

	public async createLawsuitUpdateAsyncProcess(cnj: string): Promise<LawsuitUpdateAsyncProcess> {
		const url = new URL($config.ESCAVADOR_API_URL);
		url.pathname = `api/v2/processos/numero_cnj/${cnj}/solicitar-atualizacao`;

		const headers = {
			Authorization: `Bearer ${$config.ESCAVADOR_API_KEY}`
		};

		const payload: CreateLawsuitUpdateAsyncProcessBody = {
			enviar_callback: 1,
			documentos_publicos: 0
		};

		try {
			const { data } = await this.client.post(url.toString(), payload, { headers });

			return {
				id: data.id.toString(),
				status: data.status,
				cnj: data.numero_cnj,
				createdAt: new Date(data.criado_em),
				finishedAt: data.concluido_em ? new Date(data.concluido_em) : null,
				receiveCallback: data.enviar_callback === 'SIM' ? true : false
			};
		} catch (error) {
			console.error(`Error creating async lawsuit update process for CNJ ${cnj}`);
			if (error instanceof AxiosError) {
				if (error.status === 422)
					// TO DO: refinar tratamento erro 422 - CNJ inválido ou já processado
					throw new Error('Invalid CNJ format or CNJ already processed in the same day'); // Invalid CNJ format or CNJ already processed in the same day
				if (error.status && error.status < 500)
					throw new Error('Some error ocurred - verify input data');
				if (error.status && error.status >= 500) throw new Error('Internal server error');
			}
			throw error;
		}
	}

	public async getLawsuitDataByCnj(cnj: string): Promise<GenericExtractedData> {
		const url = new URL($config.ESCAVADOR_API_URL);
		url.pathname = `api/v2/processos/numero_cnj/${cnj}`;

		const headers = {
			Authorization: `Bearer ${$config.ESCAVADOR_API_KEY}`
		};

		try {
			const { data } = await this.client.get(url.toString(), { headers });

			return data;
		} catch (error) {
			console.error(`Error extracting lawsuit data for CNJ ${cnj}`);
			if (error instanceof AxiosError) {
				if (error.status === 404) throw new Error(`Lawsuit with cnj ${cnj} not found at Escavador`);
				if (error.status === 422) throw new Error('Invalid CNJ format');
				if (error.status && error.status < 500)
					throw new Error('Some error ocurred - verify input data');
				if (error.status && error.status >= 500) throw new Error('Internal server error');
			}
			throw error;
		}
	}

	public async createLawsuitDocumentExtractionAsyncProcess(
		cnj: string,
	): Promise<LawsuitDocumentExtractionAsyncProcess> {
		const { userName, password } = getCourtCredentialsByCnj(cnj);

		const url = new URL($config.ESCAVADOR_API_URL);
		url.pathname = `api/v1/processo-tribunal/${cnj}/async`;

		const headers = {
			Authorization: `Bearer ${$config.ESCAVADOR_API_KEY}`
		};

		const payload = {
			send_callback: 1,
			autos: 1,
			usuario: userName,
			senha: password
		};

		try {
			const { data } = await this.client.post(url.toString(), payload, { headers });

			return {
				id: data.id.toString()
			};
		} catch (error) {
			console.error(`Error creating async lawsuit document extraction process for CNJ ${cnj}`);
			if (error instanceof AxiosError) {
				if (error.status === 404) throw new Error(`Lawsuit with cnj ${cnj} not found at Escavador`);
				if (error.status === 422)
					throw new Error('Invalid CNJ format or there is already an extraction process in progress');
				if (error.status && error.status < 500)
					throw new Error('Some error ocurred - verify input data');
				if (error.status && error.status >= 500) throw new Error('Internal server error');
			}
			throw error;
		}
	}

  public async downloadLawsuitDocument(documentUrl: string): Promise<Buffer> {
		const headers = {
			Authorization: `Bearer ${$config.ESCAVADOR_API_KEY}`
		};

    const { data } = await this.client.get(documentUrl, { headers, responseType: 'arraybuffer' });
    return Buffer.from(data);
  }
}
