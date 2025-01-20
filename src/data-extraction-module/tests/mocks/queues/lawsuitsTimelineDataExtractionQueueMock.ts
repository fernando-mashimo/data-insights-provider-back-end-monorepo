import { LawsuitsTimelineDataExtractionQueue } from "../../../domain/queues/lawsuitTimelineDataExtractionQueue";

export class LawsuitsTimelineDataExtractionQueueMock
	implements LawsuitsTimelineDataExtractionQueue
{
	sendExtractDataMessages(): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
