import { $config } from '$config';
import {
	DynamoDBDocumentClient,
	GetCommand,
	PutCommand,
	QueryCommand,
	QueryCommandInput
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { EventExtractLinkedinRepository } from '../../../domain/repositories/eventExtractLinkedinRepository';
import {
	EventExtractLinkedin,
	EventExtractLinkedinStatus
} from '../../../domain/entities/eventExtractLinkedin';
import { BaseDdbTableType, EMPTY_DDB_ATTRIBUTE } from './baseDdbTableTable';

type DDBItem = BaseDdbTableType & {
	[K in keyof EventExtractLinkedin]: string;
};

export class EventExtractLinkedinRepositoryImp implements EventExtractLinkedinRepository {
	private databaseClient: DynamoDBDocumentClient;

	constructor() {
		this.databaseClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
	}

	public async put(event: EventExtractLinkedin): Promise<void> {
		const params = {
			TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			Item: this.entityToDdbItem(event)
		};

		const command = new PutCommand(params);
		await this.databaseClient.send(command);
	}

	public async getById(id: string): Promise<EventExtractLinkedin> {
		const params = {
			TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			Key: {
				pk: this.getPK(id),
				sk: EMPTY_DDB_ATTRIBUTE
			}
		};

		const command = new GetCommand(params);
		const response = await this.databaseClient.send(command);

		if (!response.Item) {
			throw new Error(`EventExtractLinkedin with id ${id} not found`);
		}

		return this.ddbItemToEntity(response.Item as DDBItem);
	}

	public async getByNameAndLastExtractionDate(
		firstName: string,
		lastName: string,
		lastExtractionDate: Date
	): Promise<EventExtractLinkedin[]> {
		const params: QueryCommandInput = {
			TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			IndexName: 'gsi-overloaded-1',
			KeyConditionExpression: 'gsi1pk = :gsi1pk AND gsi1sk >= :gsi1sk',
			ExpressionAttributeValues: {
				':gsi1pk': `${firstName}#${lastName}`,
				':gsi1sk': lastExtractionDate.toISOString()
			}
		};

		const command = new QueryCommand(params);
		const response = await this.databaseClient.send(command);

		return response.Items?.map((item) => this.ddbItemToEntity(item as DDBItem)) ?? [];
	}

	/**
	 * Defining the pk attribute of dynamodb for this entity.
	 * As the table will be used for multiple entities, we are concatenating the entity name.
	 */
	private getPK(event: EventExtractLinkedin): string;
	private getPK(snapshotId: string): string;
	private getPK(x: string | EventExtractLinkedin): string {
		if (typeof x === 'string') {
			return `EventExtractLinkedin#${x}`;
		}
		return `EventExtractLinkedin#${x.id}`;
	}

	private ddbItemToEntity(item: DDBItem): EventExtractLinkedin {
		return {
			id: item.id,
			requestedName: item.requestedName,
			searchedFirstName: item.searchedFirstName,
			searchedLastName: item.searchedLastName,
			snapshotId: item.snapshotId,
			status: EventExtractLinkedinStatus[item.status as keyof typeof EventExtractLinkedinStatus],
			startDate: new Date(item.startDate),
			endDate: item.endDate ? new Date(item.endDate) : undefined,
			numberOfProfilesFounded: item.numberOfProfilesFounded
				? parseInt(item.numberOfProfilesFounded)
				: undefined
		};
	}

	private entityToDdbItem(entity: EventExtractLinkedin): DDBItem {
		return {
			pk: this.getPK(entity),
			sk: EMPTY_DDB_ATTRIBUTE,
			gsi1pk: `${entity.searchedFirstName}#${entity.searchedLastName}`,
			gsi1sk: entity.endDate ? entity.endDate.toISOString() : EMPTY_DDB_ATTRIBUTE,

			...entity,
			startDate: entity.startDate.toISOString(),
			endDate: entity.endDate ? entity.endDate.toISOString() : EMPTY_DDB_ATTRIBUTE,
			numberOfProfilesFounded: entity.numberOfProfilesFounded
				? entity.numberOfProfilesFounded.toString()
				: EMPTY_DDB_ATTRIBUTE
		};
	}
}
