import { $config } from '$config';
import { FileManagementClient } from '../../../domain/services/fileManagementClient';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export class FileManagementClientImp implements FileManagementClient {
	private client: S3Client;

	constructor() {
		this.client = new S3Client({});
	}

	public async uploadFile(path: string, contentType: string, content: Buffer): Promise<void> {
		const command = new PutObjectCommand({
			Bucket: $config.DATA_EXTRACTION_BUCKET_NAME,
			Key: path,
			Body: content,
			ContentType: contentType
		});

		await this.client.send(command);
	}
}
