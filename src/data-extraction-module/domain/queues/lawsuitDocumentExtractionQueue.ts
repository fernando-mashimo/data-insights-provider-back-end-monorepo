export interface LawsuitDocumentDownloadAndPersistQueue {
	sendDownloadAndPersistDocumentMessage(
		cnj: string,
		externalId: string,
		documentUrl: string,
	): Promise<void>;
}
