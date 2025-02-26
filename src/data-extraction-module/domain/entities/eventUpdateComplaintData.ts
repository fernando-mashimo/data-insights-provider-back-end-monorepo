export class EventUpdateComplaintData {
  constructor(
    public complaintExternalId: string,
    public lastUpdatedAt?: Date,
    public lastHashedComplaintData?: string,
    public lastPersistedAt?: Date,
    public lastInteractionDate?: Date
  ) {}
}
