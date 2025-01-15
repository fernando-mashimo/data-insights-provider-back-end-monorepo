export interface LawsuitDataUpdateClient {
	getLawsuitSubscriptionMetadataByCnj(
		cnj: string
	): Promise<LawsuitSubscriptionExternalResponse | undefined>;
	getLawsuitSubscriptionMetadataById(id: string): Promise<LawsuitSubscriptionExternalResponse>;
	createLawsuitSubscription(cnj: string): Promise<void>;
	getUpdatedLawsuitData(subscriptionId: string): Promise<UpdatedLawsuitData>;
	getUnsyncedLawsuitsSubscriptions(): Promise<UnsyncedLawsuitSubscription[]>;
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

export type UnsyncedLawsuitSubscription = {
	id: string;
	type: string;
	updatedAt: string;
};
