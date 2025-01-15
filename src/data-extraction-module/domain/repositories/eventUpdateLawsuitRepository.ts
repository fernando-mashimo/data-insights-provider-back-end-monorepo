import { EventUpdateLawsuit } from "../entities/eventUpdateLawsuit";

export interface EventUpdateLawsuitRepository {
    /**
     * create or replace item by id
     */
    put(event: EventUpdateLawsuit): Promise<void>;
}
