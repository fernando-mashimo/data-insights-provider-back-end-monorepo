export interface LawsuitDataExtractorClient {
	getLawsuits(cnpj: string, nextPageUrl?: string | null): Promise<LawsuitDataExtractionResponse>;

	getLawsuitTimeline(
		lawsuit: GenericExtractedData,
		nextPageUrl?: string | null
	): Promise<LawsuitTimelineDataExtractionResponse>;
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

export type LawsuitTimelineDataExtractionResponse = {
	timeline: GenericExtractedData[];
	hasNext: boolean;
	nextPageUrl: string | null;
};
