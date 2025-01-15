export interface LawsuitDataUpdateClient {
	getLawsuitSubscription(cnj: string): Promise<LawsuitSubscriptionExternalResponse | undefined>;
	createLawsuitSubscription(cnj: string): Promise<void>;
	getUpdatedLawsuitData(subscriptionId: string): Promise<UpdatedLawsuitData>;
}

export type GenericExtractedData = {
	[key: string]: string | number | boolean | object | null;
};

export type UpdatedLawsuitData = {
	updatedData: GenericExtractedData[];
	documentsUrls: string[];
};

export type LawsuitSubscriptionExternalResponse = {
	id: string;
	type: string;
	value: string;
	status: string;
	availability: string;
	createdAt: string;
	updatedAt: string;
};
