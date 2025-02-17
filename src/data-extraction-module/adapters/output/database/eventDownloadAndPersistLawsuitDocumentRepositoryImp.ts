import { DynamoDBDocument, PutCommand } from '@aws-sdk/lib-dynamodb';
import { EventDownloadAndPersistLawsuitDocument } from '../../../domain/entities/eventDownloadAndPersistLawsuitDocument';
import { EventDownloadAndPersistLawsuitDocumentRepository } from '../../../domain/repositories/eventDownloadAndPersistLawsuitDocumentRepository';
import { BaseDdbTableType } from './baseDdbTableTable';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { $config } from '$config';

type DDBItem = BaseDdbTableType & {
	[K in keyof EventDownloadAndPersistLawsuitDocument]: string;
};

export class EventDownloadAndPersistLawsuitDocumentRepositoryImp
	implements EventDownloadAndPersistLawsuitDocumentRepository
{
  private databaseClient: DynamoDBDocument;

  constructor() {
    this.databaseClient = DynamoDBDocument.from(new DynamoDBClient({}));
  }

	public async put(entity: EventDownloadAndPersistLawsuitDocument): Promise<void> {
		const params = {
      TableName: $config.DATA_EXTRACTION_EVENTS_TABLE_NAME,
      Item: this.entityToDdbItem(entity),
    };

    const command = new PutCommand(params);
    await this.databaseClient.send(command);
	}

  private entityToDdbItem(entity: EventDownloadAndPersistLawsuitDocument): DDBItem {
    return {
      pk: `EventDownloadAndPersistLawsuitDocument#${entity.cnj}`,
      sk: entity.startDate.toISOString(),
      gsi1pk: `EventDownloadAndPersistLawsuitDocument#${entity.cnj}`,
      gsi1sk: entity.startDate.toISOString(),

      ...entity,
      startDate: entity.startDate.toISOString(),
      endDate: entity.endDate?.toISOString(),
    };
  }
}
