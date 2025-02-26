import { EventUpdateComplaintData } from "../entities/eventUpdateComplaintData";

export interface EventUpdateComplaintDataRepository {
  put(entity: EventUpdateComplaintData): Promise<void>;
  getByComplaintExternalId(complaintExternalId: string): Promise<EventUpdateComplaintData[]>;
}
