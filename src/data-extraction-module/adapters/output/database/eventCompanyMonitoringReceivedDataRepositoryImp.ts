import { DynamoDBDocument, PutCommand } from '@aws-sdk/lib-dynamodb';
import { EventCompanyMonitoringReceivedData } from '../../../domain/entities/eventCompanyMonitoringReceivedData';
import { EventCompanyMonitoringReceivedDataRepository } from '../../../domain/repositories/eventCompanyMonitoringReceivedDataRepository';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { $config } from '$config';
import { BaseDdbTableType } from './baseDdbTableTable';

type DDBItem = BaseDdbTableType & {
  [K in keyof EventCompanyMonitoringReceivedData]: string;
};

export class EventCompanyMonitoringReceivedDataRepositoryImp
	implements EventCompanyMonitoringReceivedDataRepository
{
	private databaseClient: DynamoDBDocument;

	constructor() {
		this.databaseClient = DynamoDBDocument.from(new DynamoDBClient({}));
	}

	public async put(event: EventCompanyMonitoringReceivedData): Promise<void> {
		const params = {
			TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
			Item: this.entityToDdbItem(event)
		};

		const command = new PutCommand(params);
		await this.databaseClient.send(command);
	}

	private entityToDdbItem(entity: EventCompanyMonitoringReceivedData): DDBItem {
		return {
			pk: `EventCompanyMonitoringReceivedData#${entity.monitoredCnpj}`,
			sk: entity.id,
			gsi1pk: entity.monitoredCnpj,
			gsi1sk: entity.id,

			...entity,
			receivedAt: entity.receivedAt.toISOString()
		};
	}
}
