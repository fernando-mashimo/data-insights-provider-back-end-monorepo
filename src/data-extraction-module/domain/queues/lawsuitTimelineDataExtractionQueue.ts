export interface LawsuitsTimelineDataExtractionQueue {
	sendExtractDataMessage(input: LawsuitTimelineDataExtractionQueueInput): Promise<void>;
}

export type LawsuitTimelineDataExtractionQueueInput = {
	lawsuits: GenericLawsuitData[];
};

type GenericLawsuitData = {
	[key: string]: string | number | boolean | object | null;
};
