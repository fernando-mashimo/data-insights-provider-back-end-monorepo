export interface LawsuitDataExtractorClient {
	getLawsuitsByCnpj(
		cnpj: string,
		nextPageUrl?: string | null
	): Promise<LawsuitDataExtractionResponse>;
	verifyIfTermIsAlreadyMonitored(term: string): Promise<boolean>;
	createTermMonitoring(term: string): Promise<MonitoredTerm>;
	createLawsuitUpdateAsyncProcess(cnj: string): Promise<LawsuitUpdateAsyncProcess>;
	getLawsuitDataByCnj(cnj: string): Promise<GenericExtractedData>;
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
