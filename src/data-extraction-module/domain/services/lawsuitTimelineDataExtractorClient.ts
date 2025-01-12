export interface LawsuitTimelineDataExtractorClient {
	getLawsuitTimeline(
		cnj: string,
		nextPageUrl?: string | null
	): Promise<LawsuitTimelineDataExtractionResponse>;
}

export type GenericExtractedData = {
	[key: string]: string | number | boolean | object | null;
};

export type LawsuitTimelineDataExtractionResponse = {
	timeline: GenericExtractedData[];
	hasNext: boolean;
	nextPageUrl: string | null;
};
