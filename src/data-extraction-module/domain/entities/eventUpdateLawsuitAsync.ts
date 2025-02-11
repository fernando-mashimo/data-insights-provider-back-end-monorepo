export enum EventUpdateLawsuitAsyncStatus {
	PENDING = 'PENDING',
	FINISHED = 'FINISHED',
  NOT_FOUND = 'NOT_FOUND',
	ERROR = 'ERROR',
}

export class EventUpdateLawsuitAsync {
  public id: string;

  constructor(
    public cnj: string,
    public externalId: string,
    public status = EventUpdateLawsuitAsyncStatus.PENDING,
    public startDate = new Date(),
    public endDate?: Date,
  ) {
    this.id = `${externalId}`;
  }
}
