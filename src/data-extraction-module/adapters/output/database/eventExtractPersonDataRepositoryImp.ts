import { DynamoDBDocument, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
	EventExtractPersonData,
	EventExtractPersonDataStatus
} from '../../../domain/entities/eventExtractPersonData';
import { EventExtractPersonDataRepository } from '../../../domain/repositories/eventExtractPersonDataRepository';
import { BaseDdbTableType } from './baseDdbTableTable';
import { $config } from '$config';

type DDBItem = BaseDdbTableType & {
	[K in keyof EventExtractPersonData]: string;
};

export class EventExtractPersonDataRepositoryImp implements EventExtractPersonDataRepository {
	private databaseClient: DynamoDBDocument;

	constructor() {
		this.databaseClient = DynamoDBDocument.from(new DynamoDBClient({}));
	}

	public async put(event: EventExtractPersonData): Promise<void> {
		const params = {
			TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			Item: this.entityToDdbItem(event)
		};

		const command = new PutCommand(params);
		await this.databaseClient.send(command);
	}

	public async getByCpfAndLastExtractionDate(
		cpf: string,
		lastExtractionDate: Date
	): Promise<EventExtractPersonData[]> {
		const params = {
			TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			IndexName: 'gsi-overloaded-1',
			KeyConditionExpression: 'gsi1pk = :gsi1pk AND gsi1sk >= :gsi1sk',
			ExpressionAttributeValues: {
				':gsi1pk': cpf,
				':gsi1sk': lastExtractionDate.toISOString()
			}
		};

		const command = new QueryCommand(params);
		const response = await this.databaseClient.send(command);

		return response.Items?.map((item) => this.ddbItemToEntity(item as DDBItem)) ?? [];
	}

	private ddbItemToEntity(item: DDBItem): EventExtractPersonData {
		return {
			cpf: item.cpf,
			id: item.id,
			status: item.status as EventExtractPersonDataStatus,
			startDate: new Date(item.startDate),
			endDate: item.endDate ? new Date(item.endDate) : undefined
		};
	}

	private entityToDdbItem(entity: EventExtractPersonData): DDBItem {
		return {
			pk: `EventExtractPersonData#${entity.cpf}`,
			sk: entity.id,
			gsi1pk: entity.cpf,
			gsi1sk: entity.startDate.toISOString(),

			...entity,
			startDate: entity.startDate.toISOString(),
			endDate: entity.endDate?.toISOString()
		};
	}
}
