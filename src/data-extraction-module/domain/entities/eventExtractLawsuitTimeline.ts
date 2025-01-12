export enum EventExtractLawsuitTimelineStatus {
	PENDING = 'PENDING',
	ERROR = 'ERROR',
	FINISHED = 'FINISHED'
}

export class EventExtractLawsuitTimeline {
	constructor(
		public searchedCnj: string,
		public status: EventExtractLawsuitTimelineStatus,
		public startDate: Date,
		public endDate?: Date,
		public pagesDownloaded?: number,
		public nextPageUrl?: string | null
	) {}
}
