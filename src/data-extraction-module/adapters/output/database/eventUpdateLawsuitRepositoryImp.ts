import {
	DynamoDBDocument,
	PutCommand,
	QueryCommand,
	QueryCommandInput
} from '@aws-sdk/lib-dynamodb';
import {
	EventUpdateLawsuit,
	EventUpdateLawsuitStatus
} from '../../../domain/entities/eventUpdateLawsuit';
import { EventUpdateLawsuitRepository } from '../../../domain/repositories/eventUpdateLawsuitRepository';
import { BaseDdbTableType, EMPTY_DDB_ATTRIBUTE } from './baseDdbTableTable';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { $config } from '$config';

type DDBItem = BaseDdbTableType & {
	[K in keyof EventUpdateLawsuit]: string;
};

export class EventUpdateLawsuitRepositoryImp implements EventUpdateLawsuitRepository {
	private databaseClient: DynamoDBDocument;

	constructor() {
		this.databaseClient = DynamoDBDocument.from(new DynamoDBClient({}));
	}

	public async put(event: EventUpdateLawsuit): Promise<void> {
		const params = {
			TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			Item: this.entityToDdbItem(event)
		};

		const command = new PutCommand(params);
		await this.databaseClient.send(command);
	}

	public async getByCnjAndStatus(
		cnj: string,
		status: EventUpdateLawsuitStatus
	): Promise<EventUpdateLawsuit[]> {
		const params: QueryCommandInput = {
			TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			IndexName: 'gsi-overloaded-1',
			KeyConditionExpression: 'gsi1pk = :gsi1pk AND gsi1sk = :gsi1sk',
			ExpressionAttributeValues: {
				':gsi1pk': cnj,
				':gsi1sk': status
			}
		};

		const command = new QueryCommand(params);
		const response = await this.databaseClient.send(command);

		return response.Items?.map((item) => this.ddbItemToEntity(item as DDBItem)) ?? [];
	}

	private ddbItemToEntity(item: DDBItem): EventUpdateLawsuit {
		return {
			cnj: item.cnj,
			status: item.status as EventUpdateLawsuitStatus,
			startDate: new Date(item.startDate),
      id: item.id,
			endDate: item.endDate ? new Date(item.endDate) : undefined
		};
	}

	private entityToDdbItem(entity: EventUpdateLawsuit): DDBItem {
		return {
			pk: `EventUpdateLawsuit#${entity.cnj}`,
			sk: entity.id,
			gsi1pk: entity.cnj,
			gsi1sk: entity.status,

			...entity,
			startDate: entity.startDate.toISOString(),
			endDate: entity.endDate?.toISOString() ?? EMPTY_DDB_ATTRIBUTE
		};
	}
}
