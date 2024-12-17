export enum EventExtractLinkedinStatus {
	PENDING = 'PENDING',
	ERROR = 'ERROR',
	FINISHED = 'FINISHED'
}

export class EventExtractLinkedin {
	readonly id: string;

	constructor(
		public requestedName: string, // original requested name
		public searchedFirstName: string,
		public searchedLastName: string,
		public snapshotId: string,
		public status: EventExtractLinkedinStatus = EventExtractLinkedinStatus.PENDING,
		public errorMsg?: string,
		public startDate: Date = new Date(),
		public endDate?: Date,
		public numberOfProfilesFounded?: number
	) {
		this.id = this.snapshotId;
	}
}
