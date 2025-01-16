export interface LawsuitDataUpdateClient {
	getLawsuitSubscriptionByCnj(cnj: string): Promise<LawsuitSubscription | undefined>;
	getLawsuitSubscriptionById(id: string): Promise<LawsuitSubscription>;
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

export type LawsuitSubscription = {
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
