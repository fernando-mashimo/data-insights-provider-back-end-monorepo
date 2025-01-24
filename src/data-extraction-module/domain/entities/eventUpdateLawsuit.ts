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
		public status = EventUpdateLawsuitStatus.PENDING,
		public startDate = new Date(),
		public endDate?: Date
	) {
		this.id = `${cnj}#${startDate.toISOString()}`;
	}
}
