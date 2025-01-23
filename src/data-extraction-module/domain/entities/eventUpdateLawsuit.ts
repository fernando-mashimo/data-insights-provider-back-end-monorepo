export enum EventUpdateLawsuitStatus {
	PENDING = 'PENDING',
	ERROR = 'ERROR',
	FINISHED = 'FINISHED',
	FINISHED_WITHOUT_DOCUMENTS = 'FINISHED_WITHOUT_DOCUMENTS'
}

export class EventUpdateLawsuit {
	public id: string;

	constructor(
		public cnj: string,
		public status: EventUpdateLawsuitStatus,
		public startDate: Date,
		public endDate?: Date
	) {
		this.id = `${startDate.toISOString()}`;
	}
}
