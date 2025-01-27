import { DynamoDBDocument, PutCommand } from '@aws-sdk/lib-dynamodb';
import { EventCompanyMonitoring } from '../../../domain/entities/eventCompanyMonitoring';
import { EventCompanyMonitoringRepository } from '../../../domain/repositories/eventCompanyMonitoringRepository';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { BaseDdbTableType } from './baseDdbTableTable';
import { $config } from '$config';

type DDBItem = BaseDdbTableType & {
  [K in keyof EventCompanyMonitoring]: string;
};

export class EventCompanyMonitoringRepositoryImp implements EventCompanyMonitoringRepository {
	private databaseClient: DynamoDBDocument;

	constructor() {
		this.databaseClient = DynamoDBDocument.from(new DynamoDBClient({}));
	}

	public async put(event: EventCompanyMonitoring): Promise<void> {
    const params = {
      TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
      Item: this.entityToDdbItem(event)
    };

    const command = new PutCommand(params);
    await this.databaseClient.send(command);
	}

  private entityToDdbItem(entity: EventCompanyMonitoring): DDBItem {
    return {
      pk: `EventCompanyMonitoring#${entity.monitoredCnpj}`,
      sk: entity.id,
      gsi1pk: entity.monitoredCnpj,
      gsi1sk: entity.id,

      ...entity,
      createdAt: entity.createdAt.toISOString()
    };
  }
}
