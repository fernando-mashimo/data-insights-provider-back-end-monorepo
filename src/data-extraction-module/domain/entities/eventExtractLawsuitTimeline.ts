export enum EventExtractLawsuitTimelineStatus {
	PENDING = 'PENDING',
	ERROR = 'ERROR',
	FINISHED = 'FINISHED'
}

export class EventExtractLawsuitTimeline {
	public id: string;

	constructor(
		public searchedCnj: string,
		public status = EventExtractLawsuitTimelineStatus.PENDING,
		public startDate = new Date(),
		public endDate?: Date | undefined,
		public pagesDownloaded?: number,
		public nextPageUrl?: string | null
	) {
		this.id = `${searchedCnj}#${startDate.toISOString()}`;
	}
}
