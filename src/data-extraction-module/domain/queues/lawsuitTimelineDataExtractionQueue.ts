export interface LawsuitsTimelineDataExtractionQueue {
	sendExtractDataMessages(input: LawsuitsTimelineDataExtractionQueueInput): Promise<void>;
}

export type LawsuitsTimelineDataExtractionQueueInput = {
	lawsuits: GenericLawsuitData[];
};

type GenericLawsuitData = {
	[key: string]: string | number | boolean | object | null;
};
