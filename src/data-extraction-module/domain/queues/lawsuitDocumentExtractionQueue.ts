export interface LawsuitDocumentDownloadAndPersistQueue {
	sendDownloadAndPersistDocumentMessage(
		cnj: string,
		externalId: string,
		documentData: { url: string; fileHash: string }
	): Promise<void>;
}
