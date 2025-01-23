export enum EventExtractLawsuitTimelineStatus {
	PENDING = 'PENDING',
	ERROR = 'ERROR',
	FINISHED = 'FINISHED'
}

export class EventExtractLawsuitTimeline {
  public id: string;

	constructor(
		public searchedCnj: string,
		public status: EventExtractLawsuitTimelineStatus,
		public startDate: Date,
		public endDate?: Date,
		public pagesDownloaded?: number,
		public nextPageUrl?: string | null
	) {
    this.id = `${startDate.toISOString()}`;
  }
}
