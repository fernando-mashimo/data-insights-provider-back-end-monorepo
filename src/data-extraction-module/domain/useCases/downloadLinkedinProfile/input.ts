import { EventExtractLinkedinStatus } from '../../entities/eventExtractLinkedin';

export type DownloadLinkedinProfileUseCaseInput = {
	snapshotId: string;
	extractionStatus: EventExtractLinkedinStatus;
	error?: string;
};
