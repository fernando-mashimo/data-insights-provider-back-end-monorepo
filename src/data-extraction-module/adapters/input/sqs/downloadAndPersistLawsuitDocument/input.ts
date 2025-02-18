export type sqsEventBody = {
	cnj: string;
	externalId: string;
	documentData: { url: string; fileHash: string };
};
