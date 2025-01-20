import {
	LawsuitTimelineDataExtractionResponse,
	LawsuitTimelineDataExtractorClient
} from '../../../domain/services/lawsuitTimelineDataExtractorClient';

export class LawsuitTimelineDataExtractorClientMock implements LawsuitTimelineDataExtractorClient {
	getLawsuitTimeline(): Promise<LawsuitTimelineDataExtractionResponse> {
		throw new Error('Method not implemented.');
	}
}
