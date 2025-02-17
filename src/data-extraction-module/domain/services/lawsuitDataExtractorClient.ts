export interface LawsuitDataExtractorClient {
	createTermMonitoring(term: string): Promise<MonitoredTerm>;
	createLawsuitUpdateAsyncProcess(cnj: string): Promise<LawsuitUpdateAsyncProcess>;
	createLawsuitDocumentExtractionAsyncProcess(
    cnj: string,
		courtState: string
	): Promise<LawsuitDocumentExtractionAsyncProcess>;
  verifyIfTermIsAlreadyMonitored(term: string): Promise<boolean>;
  getLawsuitsByCnpj(
    cnpj: string,
    nextPageUrl?: string | null
  ): Promise<LawsuitDataExtractionResponse>;
  getLawsuitDataByCnj(cnj: string): Promise<GenericExtractedData>;
  downloadLawsuitDocument(documenturl: string): Promise<Buffer>;
}

export type GenericExtractedData = {
	[key: string]: string | number | boolean | object | null;
};

export type LawsuitDataExtractionResponse = {
	lawsuits: GenericExtractedData[];
	hasNext: boolean;
	totalPages: number;
	nextPageUrl: string | null;
};

export type MonitoredTerm = {
	term: string;
	variationTerm: string;
	externalId: string;
};

export type CreateTermMonitoringBody = {
	termo: string;
	variacoes?: string[];
	termos_auxiliares?: string[];
	tribunais?: string[];
};

export type GetMonitoredTermResponse = {
	id: number;
	termo: string;
	criado_em: string;
	variacoes: string[];
	termos_auxiliares: string[];
	tribunais_especificos: string[];
};

export type CreateLawsuitUpdateAsyncProcessBody = {
	enviar_callback: number;
	documentos_publicos: number;
};

export type LawsuitUpdateAsyncProcessExternalResponse = {
	id: number;
	status: string;
	numero_cnj: string;
	criado_em: string; // date-time
	concluido_em: string | null;
	enviar_callback: string;
};

export type LawsuitUpdateAsyncProcess = {
	id: string;
	status: string;
	cnj: string;
	createdAt: Date;
	finishedAt: Date | null;
	receiveCallback: boolean;
};

export type LawsuitDocumentExtractionAsyncProcessExternalResponse = {
	id: number;
	created_at: {
		date: string;
		timezone_type: number;
		timezone: string;
	};
	enviar_callback: string;
	link_api: string;
	numero_processo: string;
	resposta: string;
	status: string;
	motivo_erro: string;
	status_callback: string;
	tipo: string;
	opcoes?: {
		autos?: boolean;
	};
	tribunal: {
		sigla: string;
		nome: string;
		busca_processo: number;
		busca_nome: number;
		busca_oab: number;
		busca_documento: number;
		disponivel_autos: number;
		documentos_publicos: number;
		quantidade_creditos_busca_processo: number;
		quantidade_creditos_busca_nome: number;
		quantidade_creditos_busca_documento: number;
		quantidade_creditos_busca_oab: number;
	};
	valor: string;
};

export type LawsuitDocumentExtractionAsyncProcess = {
	id: string;
};
