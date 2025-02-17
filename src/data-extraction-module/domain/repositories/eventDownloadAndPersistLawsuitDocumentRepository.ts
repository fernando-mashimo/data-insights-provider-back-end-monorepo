import { EventDownloadAndPersistLawsuitDocument } from '../entities/eventDownloadAndPersistLawsuitDocument';

export interface EventDownloadAndPersistLawsuitDocumentRepository {
	put(entity: EventDownloadAndPersistLawsuitDocument): Promise<void>;
}
