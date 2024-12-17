export interface FileManagementClient {
	uploadFile(path: string, contentType: string, content: Buffer): Promise<void>;
}
