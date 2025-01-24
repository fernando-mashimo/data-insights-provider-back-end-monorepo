export interface LinkedinExtractorClient {
	triggerProfileExtractByName: (
		profiles: { firstName: string; lastName: string }[]
	) => Promise<string>;
	getExtractedProfile: (snapshotId: string) => Promise<GenericDataSetExtractionResponse[]>;
}

export type GenericDataSetExtractionResponse = {
	[key: string]: string | number | boolean | object | null;
};
