// import { $config } from '$config';
import { DataEncryptionClient } from '../../../../domain/services/dataEncryptionClient';
import * as crypto from 'crypto';

export class ReclameAquiTokenEncryptionClientImp implements DataEncryptionClient {
	private crypto: typeof crypto = crypto;

	// the algorithm to be used in the encryption
	private algorithm: string = 'aes-256-gcm';
	// the secret to be used in the encryption
	private secret: Buffer = Buffer.from(
		// $config.RECLAME_AQUI_TOKEN_ENCRYPTION_SECRET,
		'e65047076278998d0ea104b79b3ee32ce20249f7e25b6fd4f4a3f3684a5fb22', // locally generated secret
		'utf8'
	).subarray(0, 32);
	// length in bytes of the additional layer of random data to be used in the encryption
	private ivLength: number = 16;

	constructor() {}

	public encrypt(data: string): string {
		// generates a random initialization vector
		const iv = this.crypto.randomBytes(this.ivLength);
		// creates a cipher object with the algorithm, secret and iv
		const cipher = this.crypto.createCipheriv(this.algorithm, this.secret, iv) as crypto.CipherGCM;
		// encrypts the data
		const encrypted = cipher.update(data, 'utf8', 'hex');
		// returns the iv and the encrypted data separated by a colon. Both data are required to decrypt the data later.
		return `${iv.toString('hex')}:${encrypted}`;
	}

	public decrypt(data: string): string {
		const [iv, encrypted] = data.split(':');
		const decipher = this.crypto.createDecipheriv(
			this.algorithm,
			this.secret,
			Buffer.from(iv, 'hex')
		) as crypto.DecipherGCM;
		const decrypted = decipher.update(encrypted, 'hex', 'utf8');
		return decrypted;
	}
}
