export enum EventUpdateLawsuitStatus {
  PENDING = 'PENDING',
  ERROR = 'ERROR',
  FINISHED = 'FINISHED',
  FINISHED_WITHOUT_DOCUMENTS = 'FINISHED_WITHOUT_DOCUMENTS'
}

export class EventUpdateLawsuit {
  constructor(
    public cnj: string,
    public status: EventUpdateLawsuitStatus,
    public startDate: Date,
    public endDate?: Date
  ) {}
}
