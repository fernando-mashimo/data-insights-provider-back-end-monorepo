import { DynamoDBDocument, PutCommand } from '@aws-sdk/lib-dynamodb';
import { EventUpdateLawsuit } from '../../../domain/entities/eventUpdateLawsuit';
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

	private entityToDdbItem(entity: EventUpdateLawsuit): DDBItem {
		return {
			pk: `EventUpdateLawsuit#${entity.cnj}`,
			sk: EMPTY_DDB_ATTRIBUTE,
			gsi1pk: entity.cnj,
			gsi1sk: entity.startDate.toISOString(),

			...entity,
			startDate: entity.startDate.toISOString(),
			endDate: entity.endDate?.toISOString() ?? EMPTY_DDB_ATTRIBUTE
		};
	}
}
