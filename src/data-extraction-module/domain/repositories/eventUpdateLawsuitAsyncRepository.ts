import { EventUpdateLawsuitAsync } from "../entities/eventUpdateLawsuitAsync";

export interface EventUpdateLawsuitAsyncRepository {
  getByCnjAndLastUpdateDate(cnj: string, lastUpdateDate: Date): Promise<EventUpdateLawsuitAsync[]>;
  put(event: EventUpdateLawsuitAsync): Promise<void>;
}
