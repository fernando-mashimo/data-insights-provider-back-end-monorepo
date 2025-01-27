import { EventCompanyMonitoring } from "../entities/eventCompanyMonitoring";

export interface EventCompanyMonitoringRepository {
  put(event: EventCompanyMonitoring): Promise<void>;
}
