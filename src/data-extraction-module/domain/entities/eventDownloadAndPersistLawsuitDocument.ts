export enum EventDownloadAndPersistLawsuitDocumentStatus {
  PENDING = 'PENDING',
  FINISHED = 'FINISHED'
}

export class EventDownloadAndPersistLawsuitDocument {
  constructor(
    public cnj: string,
    public externalId: string,
    public status = EventDownloadAndPersistLawsuitDocumentStatus.PENDING,
    public startDate = new Date(),
    public endDate?: Date,
  ) {}
}
