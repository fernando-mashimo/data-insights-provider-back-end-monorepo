import { DynamoDBDocument, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ComplaintsDataExtractorToken } from '../../../domain/entities/complaintsDataExtractorToken';
import { ComplaintsDataExtractorTokenRepository } from '../../../domain/repositories/complaintsDataExtractorTokenRepository';
import { BaseDdbTableType, EMPTY_DDB_ATTRIBUTE } from './baseDdbTableTable';
// import { $config } from '$config';

type DDBItem = BaseDdbTableType & {
	[K in keyof ComplaintsDataExtractorToken]: string;
};

export class ComplaintsDataExtractorTokenRepositoryImp
	implements ComplaintsDataExtractorTokenRepository
{
	private databaseClient: DynamoDBDocument;

	constructor() {
		this.databaseClient = DynamoDBDocument.from(new DynamoDBClient({}));
	}

	public async getByCnpj(cnpj: string): Promise<ComplaintsDataExtractorToken[]> {
		const params = {
			// TableName: $config.RECLAME_AQUI_TOKEN_TABLE_NAME
			TableName: 'reclame_aqui_tokens',
			IndexName: 'gsi-reclame-aqui-token',
			KeyConditionExpression:
				'gsiReclameAquiPk = :gsiReclameAquiPk AND gsiReclameAquiSk = :gsiReclameAquiSk',
			ExpressionAttributeValues: {
				':gsiReclameAquiPk': `ComplaintsDataExtractorToken#${cnpj}`,
				':gsiReclameAquiSk': EMPTY_DDB_ATTRIBUTE
			}
		};

		const command = new QueryCommand(params);
		const response = await this.databaseClient.send(command);

		return response.Items?.map((item) => this.ddbItemToEntity(item as DDBItem)) ?? [];
	}

	public async getAllCompaniesTokens(): Promise<ComplaintsDataExtractorToken[]> {
		const params = {
			// TableName: $config.RECLAME_AQUI_TOKEN_TABLE_NAME,
			TableName: 'reclame_aqui_tokens',
			KeyConditionExpression: 'pk = :pk',
			ExpressionAttributeValues: {
				':pk': 'ComplaintsDataExtractorToken'
			}
		};

		const command = new QueryCommand(params);
		const response = await this.databaseClient.send(command);

		return response.Items?.map((item) => this.ddbItemToEntity(item as DDBItem)) ?? [];
	}

	public async put(token: ComplaintsDataExtractorToken): Promise<void> {
		const params = {
			// TableName: $config.RECLAME_AQUI_TOKEN_TABLE_NAME,
			TableName: 'reclame_aqui_tokens',
			Item: this.entityToDdbItem(token)
		};

		const command = new PutCommand(params);
		await this.databaseClient.send(command);
	}

	private ddbItemToEntity(item: DDBItem): ComplaintsDataExtractorToken {
		return {
			cnpj: item.cnpj,
			refreshToken: item.refreshToken,
			accessToken: item.accessToken,
			updatedAt: new Date(item.updatedAt)
		};
	}

	private entityToDdbItem(entity: ComplaintsDataExtractorToken): DDBItem {
		return {
			pk: `ComplaintsDataExtractorToken`,
			sk: EMPTY_DDB_ATTRIBUTE,
			gsiReclameAquiPk: `ComplaintsDataExtractorToken#${entity.cnpj}`,
			gsiReclameAquiSk: EMPTY_DDB_ATTRIBUTE,

			...entity,
			updatedAt: entity.updatedAt.toISOString()
		};
	}
}
