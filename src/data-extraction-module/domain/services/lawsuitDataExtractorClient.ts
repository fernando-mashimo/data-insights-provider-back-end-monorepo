export interface LawsuitDataExtractorClient {
	getLawsuits(cnpj: string, nextPageUrl?: string | null): Promise<LawsuitDataExtractionResponse>;
	verifyIfTermIsAlreadyMonitored(term: string): Promise<boolean>;
	createTermMonitoring(term: string): Promise<MonitoredTerm>;
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
