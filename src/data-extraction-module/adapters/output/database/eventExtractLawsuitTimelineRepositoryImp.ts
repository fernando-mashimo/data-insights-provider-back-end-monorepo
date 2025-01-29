import {
	DynamoDBDocument,
	PutCommand,
	QueryCommand,
	QueryCommandInput
} from '@aws-sdk/lib-dynamodb';
import {
	EventExtractLawsuitTimeline,
	EventExtractLawsuitTimelineStatus
} from '../../../domain/entities/eventExtractLawsuitTimeline';
import { EventExtractLawsuitTimelineRepository } from '../../../domain/repositories/eventExtractLawsuitTimelineRepository';
import { BaseDdbTableType, EMPTY_DDB_ATTRIBUTE } from './baseDdbTableTable';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { $config } from '$config';

type DDBItem = BaseDdbTableType & {
	[K in keyof EventExtractLawsuitTimeline]: string;
};

export class EventExtractLawsuitTimelineRepositoryImp
	implements EventExtractLawsuitTimelineRepository
{
	private databaseClient: DynamoDBDocument;

	constructor() {
		this.databaseClient = DynamoDBDocument.from(new DynamoDBClient({}));
	}

	public async put(event: EventExtractLawsuitTimeline): Promise<void> {
		const params = {
			TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			Item: this.entityToDdbItem(event)
		};

		const command = new PutCommand(params);
		await this.databaseClient.send(command);
	}

	public async getByCnjAndLastExtractionDate(
		cnj: string,
		extractionTimeWindow?: Date
	): Promise<EventExtractLawsuitTimeline[]> {
		const params: QueryCommandInput = {
			TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			IndexName: 'gsi-overloaded-1',
			KeyConditionExpression: 'gsi1pk = :gsi1pk AND gsi1sk >= :gsi1sk',
			ExpressionAttributeValues: {
				':gsi1pk': cnj,
				':gsi1sk': extractionTimeWindow?.toISOString()
			}
		};

		const command = new QueryCommand(params);
		const response = await this.databaseClient.send(command);

		return response.Items?.map((item) => this.ddbItemToEntity(item as DDBItem)) ?? [];
	}

	private ddbItemToEntity(item: DDBItem): EventExtractLawsuitTimeline {
		return {
			searchedCnj: item.searchedCnj,
			status: item.status as EventExtractLawsuitTimelineStatus,
			startDate: new Date(item.startDate),
			id: item.id,
			endDate: item.endDate ? new Date(item.endDate) : undefined,
			pagesDownloaded: item.pagesDownloaded ? parseInt(item.pagesDownloaded) : undefined,
			nextPageUrl: item.nextPageUrl !== EMPTY_DDB_ATTRIBUTE ? item.nextPageUrl : null
		};
	}

	private entityToDdbItem(entity: EventExtractLawsuitTimeline): DDBItem {
		return {
			pk: `EventExtractLawsuitTimeline#${entity.searchedCnj}`,
			sk: entity.id,
			gsi1pk: entity.searchedCnj,
			gsi1sk: entity.startDate.toISOString(),

			...entity,
			startDate: entity.startDate.toISOString(),
			endDate: entity.endDate ? entity.endDate.toISOString() : EMPTY_DDB_ATTRIBUTE,
			pagesDownloaded: entity.pagesDownloaded?.toString(),
			nextPageUrl: entity.nextPageUrl ?? EMPTY_DDB_ATTRIBUTE
		};
	}
}
