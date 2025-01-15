export enum EventUpdateLawsuitStatus {
  PENDING = 'PENDING',
  ERROR = 'ERROR',
  FINISHED = 'FINISHED'
}

export class EventUpdateLawsuit {
  constructor(
    public cnj: string,
    public status: EventUpdateLawsuitStatus,
    public startDate: Date,
    public endDate?: Date
  ) {}
}
