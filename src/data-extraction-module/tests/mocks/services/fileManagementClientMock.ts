import { FileManagementClient } from '../../../domain/services/fileManagementClient';

export class FileManagementClientMock implements FileManagementClient {
	uploadFile(): Promise<void> {
		throw new Error('Method not implemented.');
	}
	downloadPdfFile(): Promise<Buffer> {
		throw new Error('Method not implemented.');
	}
}
