export interface DataEncryptionClient {
  encrypt(data: string): string;
  decrypt(data: string): string;
}
