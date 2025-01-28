import { EventCompanyMonitoringReceivedData } from "../entities/eventCompanyMonitoringReceivedData";

export interface EventCompanyMonitoringReceivedDataRepository {
  put(event: EventCompanyMonitoringReceivedData): Promise<void>;
}
