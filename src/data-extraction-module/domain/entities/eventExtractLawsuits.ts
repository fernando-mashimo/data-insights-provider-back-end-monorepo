export enum EventExtractLawsuitsStatus {
	PENDING = 'PENDING',
	ERROR = 'ERROR',
	FINISHED = 'FINISHED'
}

export class EventExtractLawsuits {
  constructor(
    public requestedCnpj: string, // original requested cnpj
    public searchedCnpj: string, // cleared cnpj searched
    public status: EventExtractLawsuitsStatus,
    public startDate: Date,
    public endDate?: Date,
    public totalPages?: number,
    public pagesDownloaded?: number,
    public nextPageUrl?: string | null,
  ) {};
}
