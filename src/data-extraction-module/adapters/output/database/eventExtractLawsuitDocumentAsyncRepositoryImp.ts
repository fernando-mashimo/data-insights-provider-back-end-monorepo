import { DynamoDBDocument, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
	EventExtractLawsuitDocumentAsync,
	EventExtractLawsuitDocumentAsyncStatus
} from '../../../domain/entities/eventExtractLawsuitDocumentAsync';
import { EventExtractLawsuitDocumentAsyncRepository } from '../../../domain/repositories/eventExtractLawsuitDocumentAsyncRepository';
import { BaseDdbTableType } from './baseDdbTableTable';
import { $config } from '$config';

type DDBItem = BaseDdbTableType & {
	[K in keyof EventExtractLawsuitDocumentAsync]: string;
};

export class EventExtractLawsuitDocumentAsyncRepositoryImp
	implements EventExtractLawsuitDocumentAsyncRepository
{
	private databaseClient: DynamoDBDocument;

	constructor() {
		this.databaseClient = DynamoDBDocument.from(new DynamoDBClient({}));
	}

	public async put(entity: EventExtractLawsuitDocumentAsync): Promise<void> {
		const params = {
			TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			Item: this.entityToDdbItem(entity)
		};

		const command = new PutCommand(params);
		await this.databaseClient.send(command);
	}

	public async getByCnjAndLastExtractionDate(
		cnj: string,
		lastExtractionDate: Date
	): Promise<EventExtractLawsuitDocumentAsync[]> {
		const params = {
			TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			IndexName: 'gsi-overloaded-1',
			KeyConditionExpression: 'gsi1pk = :gsi1pk AND gsi1sk >= :gsi1sk',
			ExpressionAttributeValues: {
				':gsi1pk': `EventExtractLawsuitDocumentAsync#${cnj}`,
				':gsi1sk': lastExtractionDate.toISOString()
			}
		};

		const command = new QueryCommand(params);
		const response = await this.databaseClient.send(command);

		return response.Items?.map((item) => this.ddbItemToEntity(item as DDBItem)) ?? [];
	}

	public async getByCnjAndExternalId(
		cnj: string,
		externalId: string
	): Promise<EventExtractLawsuitDocumentAsync> {
		const params = {
			TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			Key: {
				pk: `EventExtractLawsuitDocumentAsync#${cnj}`,
				sk: externalId
			}
		};

		const command = new GetCommand(params);
		const response = await this.databaseClient.send(command);

		if (!response.Item) {
			throw new Error(
				`EventExtractLawsuitDocumentAsync with cnj ${cnj} and external id ${externalId} not found`
			);
		}

		return this.ddbItemToEntity(response.Item as DDBItem);
	}

	private ddbItemToEntity(item: DDBItem): EventExtractLawsuitDocumentAsync {
		return {
			cnj: item.cnj,
			externalId: item.externalId,
			status: item.status as EventExtractLawsuitDocumentAsyncStatus,
			startDate: new Date(item.startDate),
			endDate: item.endDate ? new Date(item.endDate) : undefined,
		};
	}

	private entityToDdbItem(entity: EventExtractLawsuitDocumentAsync): DDBItem {
		return {
			pk: `EventExtractLawsuitDocumentAsync#${entity.cnj}`,
			sk: entity.externalId,
			gsi1pk: `EventExtractLawsuitDocumentAsync#${entity.cnj}`,
			gsi1sk: entity.startDate.toISOString(),

			...entity,
			startDate: entity.startDate.toISOString(),
			endDate: entity.endDate?.toISOString()
		};
	}
}
