export interface LawsuitDataExtractorClient {
	getLawsuits(cnpj: string, nextPageUrl?: string | null): Promise<LawsuitDataExtractionResponse>;
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
