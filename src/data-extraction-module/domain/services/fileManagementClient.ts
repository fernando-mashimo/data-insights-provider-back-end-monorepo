export interface FileManagementClient {
	uploadFile(path: string, contentType: string, content: Buffer): Promise<void>;
  downloadPdfFile(fileUrl: string, token?: string): Promise<Buffer>;
}
