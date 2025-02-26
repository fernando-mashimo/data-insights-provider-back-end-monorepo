import { SQSEvent } from 'aws-lambda';
import { CreateComplaintsExtractionMetadataUseCase } from '../../../../domain/useCases/createComplaintsExtractionMetadata';
import { EventComplaintsExtractionMetadataRepositoryImp } from '../../../output/database/eventComplaintsExtractionMetadataRepositoryImp';
import { ComplaintsDataExtractorClientImp } from '../../../output/http/complaintsDataExtractorClientImp';
import { sqsEvent } from './input';
import { CreateComplaintsExtractionMetadataUseCaseInput } from '../../../../domain/useCases/createComplaintsExtractionMetadata/input';

const eventComplaintsExtractionMetadataRepository =
	new EventComplaintsExtractionMetadataRepositoryImp();
const complaintsDataExtractorClient = new ComplaintsDataExtractorClientImp();
const createComplaintsExtractionMetadataUseCase = new CreateComplaintsExtractionMetadataUseCase(
	eventComplaintsExtractionMetadataRepository,
	complaintsDataExtractorClient
);

export const handler = async (event: SQSEvent): Promise<void> => {
	for (const record of event.Records) {
		const { refreshToken } = JSON.parse(record.body) as sqsEvent;

		const usecaseInput: CreateComplaintsExtractionMetadataUseCaseInput = {
			refreshToken
		};

		await createComplaintsExtractionMetadataUseCase.execute(usecaseInput);
	}
};

const sqsRecordAttributes = {
	messageId: '',
	receiptHandle: '',
	attributes: {
		ApproximateReceiveCount: '',
		SentTimestamp: '',
		SenderId: '',
		ApproximateFirstReceiveTimestamp: ''
	},
	messageAttributes: {
		refreshToken: {
			stringValue: '',
			dataType: 'String'
		}
	},
	md5OfBody: '',
	md5OfMessageAttributes: undefined,
	eventSource: '',
	eventSourceARN: '',
	awsRegion: 'us-east-1'
};

handler({
	Records: [
		{
			body: JSON.stringify({
				refreshToken:
					'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIyOTBmMmZhMC02ZGQ1LTRhNmQtYmRkMC02NWMxN2E2OGNmMjAifQ.eyJleHAiOjE3NDA1ODc4NjUsImlhdCI6MTc0MDU4NDI2NSwianRpIjoiNDI3ZGM2YTYtMGRmOS00NWE3LTlkMTQtY2ZmZGM0OGRiMjBkIiwiaXNzIjoiaHR0cHM6Ly9hdXRoLnJlY2xhbWVhcXVpLmNvbS5ici9hdXRoL3JlYWxtcy9yZWNsYW1lYXF1aS1jb21wYW55IiwiYXVkIjoiaHR0cHM6Ly9hdXRoLnJlY2xhbWVhcXVpLmNvbS5ici9hdXRoL3JlYWxtcy9yZWNsYW1lYXF1aS1jb21wYW55Iiwic3ViIjoiZjphN2VkYzA1Yy02MzNkLTQ0YzItYWRiYi0xMjVlZWMwOWQ2ODU6cVV5aERWMHoxczNEdXhLQyIsInR5cCI6IlJlZnJlc2giLCJhenAiOiJzaXRlcHVibGljbyIsInNlc3Npb25fc3RhdGUiOiIyYWVkNjY2My0xNTFhLTQ3MTctOTJlZC1lYThmZjE1ZTMyZmQiLCJzY29wZSI6Im9wZW5pZCIsInNpZCI6IjJhZWQ2NjYzLTE1MWEtNDcxNy05MmVkLWVhOGZmMTVlMzJmZCJ9.caFHUYxBbqTM7uGvSVVCAl2QMgNPRm7LDqa1qUZ9-kc'
			}),
			...sqsRecordAttributes
		}
	]
});
