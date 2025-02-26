import { DynamoDBDocument, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { EventUpdateComplaintData } from '../../../domain/entities/eventUpdateComplaintData';
import { EventUpdateComplaintDataRepository } from '../../../domain/repositories/eventUpdateComplaintDataRepository';
import { BaseDdbTableType, EMPTY_DDB_ATTRIBUTE } from './baseDdbTableTable';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

type DDBItem = BaseDdbTableType & {
	[K in keyof EventUpdateComplaintData]: string;
};

export class EventUpdateComplaintDataRepositoryImp implements EventUpdateComplaintDataRepository {
  private databaseClient: DynamoDBDocument;

  constructor() {
    this.databaseClient = DynamoDBDocument.from(new DynamoDBClient({}));
  }

	public async put(entity: EventUpdateComplaintData): Promise<void> {
    const params = {
      // TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
      TableName: 'extraction_events',
      Item: this.entityToDdbItem(entity)
    };

    const command = new PutCommand(params);
    await this.databaseClient.send(command);
	}

	public async getByComplaintExternalId(
		complaintExternalId: string
	): Promise<EventUpdateComplaintData[]> {
    const params = {
			// TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			TableName: 'extraction_events',
			KeyConditionExpression: 'pk = :pk',
			ExpressionAttributeValues: {
				':pk': `EventUpdateComplaintData#${complaintExternalId}`
			}
		};

    const command = new QueryCommand(params);
    const response = await this.databaseClient.send(command);

    return response.Items?.map((item) => this.ddbItemToEntity(item as DDBItem)) ?? [];
	}

	private ddbItemToEntity(item: DDBItem): EventUpdateComplaintData {
    return {
      complaintExternalId: item.complaintExternalId,
			lastUpdatedAt: item.lastUpdatedAt ? new Date(item.lastUpdatedAt) : undefined,
			lastHashedComplaintData: item.lastHashedComplaintData ?? undefined,
			lastPersistedAt: item.lastPersistedAt ? new Date(item.lastPersistedAt) : undefined,
			lastInteractionDate: item.lastInteractionDate ? new Date(item.lastInteractionDate) : undefined
		};
	}

  private entityToDdbItem(entity: EventUpdateComplaintData): DDBItem {
    return {
      pk: `EventUpdateComplaintData#${entity.complaintExternalId}`,
      sk: EMPTY_DDB_ATTRIBUTE,
      gsi1pk: `EventUpdateComplaintData#${entity.complaintExternalId}`,
      gsi1sk: EMPTY_DDB_ATTRIBUTE,

      complaintExternalId: entity.complaintExternalId,
      lastUpdatedAt: entity.lastUpdatedAt?.toISOString(),
      lastHashedComplaintData: entity.lastHashedComplaintData ?? undefined,
      lastPersistedAt: entity.lastPersistedAt?.toISOString(),
      lastInteractionDate: entity.lastInteractionDate?.toISOString()
    };
  }
}
