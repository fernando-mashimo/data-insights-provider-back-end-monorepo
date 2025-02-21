// import { $config } from '$config';
import { DataEncryptionClient } from '../../../../domain/services/dataEncryptionClient';
import * as crypto from 'crypto';

export class ReclameAquiTokenEncryptionClientImp implements DataEncryptionClient {
	private algorithm: string = 'aes-256-gcm';
	private secret: Buffer = Buffer.from(
		// $config.RECLAME_AQUI_TOKEN_ENCRYPTION_SECRET,
		'e65047076278998d0ea104b79b3ee32ce20249f7e25b6fd4f4a3f3684a5fb22',
		'utf8'
	).subarray(0, 32);

	private ivLength: number = 16;
	private crypto: typeof crypto = crypto;

	constructor() {}

	public encrypt(data: string): string {
		const iv = this.crypto.randomBytes(this.ivLength);
		const cipher = this.crypto.createCipheriv(this.algorithm, this.secret, iv) as crypto.CipherGCM;
		let encrypted = cipher.update(data, 'utf8', 'hex');
		encrypted += cipher.final('hex');
		const authTag = cipher.getAuthTag().toString('hex');
		return `${iv.toString('hex')}:${encrypted}:${authTag}`;
	}

	public decrypt(data: string): string {
		const [iv, encrypted, authTag] = data.split(':');
		const decipher = this.crypto.createDecipheriv(
			this.algorithm,
			this.secret,
			Buffer.from(iv, 'hex')
		) as crypto.DecipherGCM;
		decipher.setAuthTag(Buffer.from(authTag, 'hex'));
		let decrypted = decipher.update(encrypted, 'hex', 'utf8');
		decrypted += decipher.final('utf8');
		return decrypted;
	}
}
