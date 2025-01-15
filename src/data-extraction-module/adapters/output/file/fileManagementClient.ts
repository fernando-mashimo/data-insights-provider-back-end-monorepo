import { $config } from '$config';
import axios, { Axios } from 'axios';
import { FileManagementClient } from '../../../domain/services/fileManagementClient';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export class FileManagementClientImp implements FileManagementClient {
	private s3Client: S3Client;
  private axiosClient: Axios;

	constructor() {
		this.s3Client = new S3Client({});
    this.axiosClient = axios.create({
      timeout: $config.AXIOS_REQUEST_TIMEOUT_SECONDS * 1000
    });
	}

  public async downloadPdfFile(fileUrl: string): Promise<Buffer> {
    const { data } = await this.axiosClient.get(fileUrl, { responseType: 'arraybuffer' });

    return Buffer.from(data);
  }

	public async uploadFile(path: string, contentType: string, content: Buffer): Promise<void> {
		const command = new PutObjectCommand({
			Bucket: $config.DATA_EXTRACTION_BUCKET_NAME,
			Key: path,
			Body: content,
			ContentType: contentType
		});

		await this.s3Client.send(command);
	}

}
