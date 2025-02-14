export enum EventExtractLawsuitDocumentAsyncStatus {
	PENDING = 'PENDING',
	FINISHED = 'FINISHED'
}

export class EventExtractLawsuitDocumentAsync {
	constructor(
		public cnj: string,
		public externalId: string,
		public status = EventExtractLawsuitDocumentAsyncStatus.PENDING,
		public startDate = new Date(),
		public endDate?: Date,
    public totalDocuments?: number,
    public documentsDownloaded?: number
	) {}
}
