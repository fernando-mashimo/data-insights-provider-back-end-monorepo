export enum EventExtractLawsuitsStatus {
	PENDING = 'PENDING',
	ERROR = 'ERROR',
	FINISHED = 'FINISHED'
}

export class EventExtractLawsuits {
	public id: string;

	constructor(
		public requestedCnpj: string, // original requested cnpj
		public searchedCnpj: string, // cleared cnpj searched
		public status = EventExtractLawsuitsStatus.PENDING,
		public startDate = new Date(),
		public endDate?: Date,
		public totalPages?: number,
		public pagesDownloaded?: number,
		public nextPageUrl?: string | null
	) {
		this.id = `${searchedCnpj}#${startDate.toISOString()}`;
	}
}
