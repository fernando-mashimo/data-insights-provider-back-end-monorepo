export enum EventExtractPersonDataStatus {
	PENDING = 'PENDING',
	FINISHED = 'FINISHED'
}

export class EventExtractPersonData {
	readonly id: string;

	constructor(
		public cpf: string,
		public status: EventExtractPersonDataStatus = EventExtractPersonDataStatus.PENDING,
		public startDate: Date = new Date(),
		public endDate?: Date
	) {
		this.id = startDate.toISOString();
	}
}
