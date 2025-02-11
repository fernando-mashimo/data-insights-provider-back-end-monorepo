import { DynamoDBDocument, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import {
	EventUpdateLawsuitAsync,
	EventUpdateLawsuitAsyncStatus
} from '../../../domain/entities/eventUpdateLawsuitAsync';
import { EventUpdateLawsuitAsyncRepository } from '../../../domain/repositories/eventUpdateLawsuitAsyncRepository';
import { BaseDdbTableType } from './baseDdbTableTable';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { $config } from '$config';

type DDBItem = BaseDdbTableType & {
	[K in keyof EventUpdateLawsuitAsync]: string;
};

export class EventUpdateLawsuitAsyncRepositoryImp implements EventUpdateLawsuitAsyncRepository {
	private databaseClient: DynamoDBDocument;

	constructor() {
		this.databaseClient = DynamoDBDocument.from(new DynamoDBClient({}));
	}

	public async put(event: EventUpdateLawsuitAsync): Promise<void> {
		const params = {
			TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			Item: this.entityToDdbItem(event)
		};

		const command = new PutCommand(params);
		await this.databaseClient.send(command);
	}

	public async getByCnjAndLastUpdateDate(
		cnj: string,
		lastUpdateDate: Date
	): Promise<EventUpdateLawsuitAsync[]> {
		const params = {
			TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			IndexName: 'gsi-overloaded-1',
			KeyConditionExpression: 'gsi1pk = :gsi1pk AND gsi1sk >= :gsi1sk',
			ExpressionAttributeValues: {
				':gsi1pk': `EventUpdateLawsuitAsync#${cnj}`,
				':gsi1sk': lastUpdateDate.toISOString()
			}
		};

		const command = new QueryCommand(params);
		const response = await this.databaseClient.send(command);

		return response.Items?.map((item) => this.ddbItemToEntity(item as DDBItem)) ?? [];
	}

	public async getByCnjAndExternalId(
		cnj: string,
		externalId: string
	): Promise<EventUpdateLawsuitAsync> {
		const params = {
			TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			Key: {
				pk: `EventUpdateLawsuitAsync#${cnj}`,
				sk: externalId
			}
		};

		const command = new GetCommand(params);
		const response = await this.databaseClient.send(command);

		if (!response.Item) {
			throw new Error(
				`EventUpdateLawsuitAsync with cnj ${cnj} and external id ${externalId} not found`
			);
		}

		return this.ddbItemToEntity(response.Item as DDBItem);
	}

	private ddbItemToEntity(item: DDBItem): EventUpdateLawsuitAsync {
		return {
			cnj: item.cnj,
			externalId: item.externalId,
			status: item.status as EventUpdateLawsuitAsyncStatus,
			startDate: new Date(item.startDate),
			id: item.id,
			endDate: item.endDate ? new Date(item.endDate) : undefined
		};
	}

	private entityToDdbItem(entity: EventUpdateLawsuitAsync): DDBItem {
		return {
			pk: `EventUpdateLawsuitAsync#${entity.cnj}`,
			sk: entity.id,
			gsi1pk: `EventUpdateLawsuitAsync#${entity.cnj}`,
			gsi1sk: entity.startDate.toISOString(),

			...entity,
			externalId: entity.externalId,
			startDate: entity.startDate.toISOString(),
			endDate: entity.endDate?.toISOString()
		};
	}
}
