import {
	DynamoDBDocumentClient,
	PutCommand,
	QueryCommand,
	QueryCommandInput
} from '@aws-sdk/lib-dynamodb';
import {
	EventExtractLawsuits,
	EventExtractLawsuitsStatus
} from '../../../domain/entities/eventExtractLawsuits';
import { EventExtractLawsuitRepository } from '../../../domain/repositories/eventExtractLawsuitRepository';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { $config } from '$config';
import { BaseDdbTableType, EMPTY_DDB_ATTRIBUTE } from './baseDdbTableTable';

type DDBItem = BaseDdbTableType & {
	[K in keyof EventExtractLawsuits]: string;
};

export class EventExtractLawsuitRepositoryImp implements EventExtractLawsuitRepository {
	private databaseClient: DynamoDBDocumentClient;

	constructor() {
		this.databaseClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
	}

	public async put(event: EventExtractLawsuits): Promise<void> {
		const params = {
			TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			Item: this.entityToDdbItem(event)
		};

		const command = new PutCommand(params);
		await this.databaseClient.send(command);
	}

	public async getByCnpjAndLastExtractionDate(
		cnpj: string,
		extractionTimeWindow?: Date
	): Promise<EventExtractLawsuits[]> {
		const params: QueryCommandInput = {
			TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			IndexName: 'gsi-overloaded-1',
			KeyConditionExpression: 'gsi1pk = :gsi1pk AND gsi1sk >= :gsi1sk',
			ExpressionAttributeValues: {
				':gsi1pk': cnpj,
				':gsi1sk': extractionTimeWindow?.toISOString()
			}
		};

		const command = new QueryCommand(params);
		const response = await this.databaseClient.send(command);

		return response.Items?.map((item) => this.ddbItemToEntity(item as DDBItem)) ?? [];
	}

	private ddbItemToEntity(item: DDBItem): EventExtractLawsuits {
		return {
			requestedCnpj: item.requestedCnpj,
			searchedCnpj: item.searchedCnpj,
			status: item.status as EventExtractLawsuitsStatus,
			startDate: new Date(item.startDate),
			id: item.id,
			endDate: item.endDate ? new Date(item.endDate) : undefined,
			totalPages: item.totalPages ? parseInt(item.totalPages) : undefined,
			pagesDownloaded: item.pagesDownloaded ? parseInt(item.pagesDownloaded) : undefined,
			nextPageUrl: item.nextPageUrl !== EMPTY_DDB_ATTRIBUTE ? item.nextPageUrl : null
		};
	}

	private entityToDdbItem(entity: EventExtractLawsuits): DDBItem {
		return {
			pk: `EventExtractLawsuits#${entity.searchedCnpj}`,
			sk: entity.id,
			gsi1pk: entity.searchedCnpj,
			gsi1sk: entity.startDate.toISOString(),

			...entity,
			startDate: entity.startDate.toISOString(),
			endDate: entity.endDate ? entity.endDate.toISOString() : EMPTY_DDB_ATTRIBUTE,
			totalPages: entity.totalPages ? entity.totalPages.toString() : EMPTY_DDB_ATTRIBUTE,
			pagesDownloaded: entity.pagesDownloaded
				? entity.pagesDownloaded.toString()
				: EMPTY_DDB_ATTRIBUTE,
			nextPageUrl: entity.nextPageUrl ?? EMPTY_DDB_ATTRIBUTE
		};
	}
}
