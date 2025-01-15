export interface FileManagementClient {
	uploadFile(path: string, contentType: string, content: Buffer): Promise<void>;
  downloadPdfFile(fileUrl: string): Promise<Buffer>;
}
