import { EventComplaintsExtractionMetadata } from "../entities/eventComplaintsExtractionMetadata";

export interface EventComplaintsExtractionMetadataRepository {
  getByCnpj(cnpj: string): Promise<EventComplaintsExtractionMetadata[]>;
  put(entity: EventComplaintsExtractionMetadata): Promise<void>;
}
