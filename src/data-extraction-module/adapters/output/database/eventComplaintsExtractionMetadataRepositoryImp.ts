// import { $config } from '$config';
import { DynamoDBDocument, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { EventComplaintsExtractionMetadata } from '../../../domain/entities/eventComplaintsExtractionMetadata';
import { EventComplaintsExtractionMetadataRepository } from '../../../domain/repositories/eventComplaintsExtractionMetadataRepository';
import { BaseDdbTableType, EMPTY_DDB_ATTRIBUTE } from './baseDdbTableTable';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

type DDBItem = BaseDdbTableType & {
	[K in keyof EventComplaintsExtractionMetadata]: string;
};

export class EventComplaintsExtractionMetadataRepositoryImp
	implements EventComplaintsExtractionMetadataRepository
{
	private databaseClient: DynamoDBDocument;

	constructor() {
		this.databaseClient = DynamoDBDocument.from(new DynamoDBClient({}));
	}

	public async getByCnpj(cnpj: string): Promise<EventComplaintsExtractionMetadata[]> {
		const params = {
			// TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			TableName: 'extraction_events',
			KeyConditionExpression: 'pk = :pk',
			ExpressionAttributeValues: {
				':pk': `EventComplaintsExtractionMetadata#${cnpj}`
			}
		};

		const command = new QueryCommand(params);
		const response = await this.databaseClient.send(command);

		return response.Items?.map((item) => this.ddbItemToEntity(item as DDBItem)) ?? [];
	}

	public async put(entity: EventComplaintsExtractionMetadata): Promise<void> {
		const params = {
			// TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			TableName: 'extraction_events',
			Item: this.entityToDdbItem(entity)
		};

		const command = new PutCommand(params);
		await this.databaseClient.send(command);
	}

	private ddbItemToEntity(item: DDBItem): EventComplaintsExtractionMetadata {
		return {
			cnpj: item.cnpj,
			companyName: item.companyName,
			complaintsExtractorExternalId: item.complaintsExtractorExternalId,
			lastUpdatedAt: new Date(item.lastUpdatedAt),
			lastComplaintsListHash: item.lastComplaintsListHash ?? undefined,
			lastComplaintsListPersistedAt: item.lastComplaintsListPersistedAt
				? new Date(item.lastComplaintsListPersistedAt)
				: undefined
		};
	}

	private entityToDdbItem(entity: EventComplaintsExtractionMetadata): DDBItem {
		return {
			pk: `EventComplaintsExtractionMetadata#${entity.cnpj}`,
			sk: EMPTY_DDB_ATTRIBUTE,
			gsi1pk: `EventComplaintsExtractionMetadata#${entity.cnpj}`,
			gsi1sk: EMPTY_DDB_ATTRIBUTE,

			...entity,
			lastUpdatedAt: entity.lastUpdatedAt.toISOString(),
			lastComplaintsListHash: entity.lastComplaintsListHash ?? EMPTY_DDB_ATTRIBUTE,
			lastComplaintsListPersistedAt: entity.lastComplaintsListPersistedAt?.toISOString()
		};
	}
}
