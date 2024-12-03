import { IllegalArgumentError } from '../../../domain/errors/illegalArgumentError';
import { IllegalBodyError } from '../../../domain/errors/illegalBodyError';

export class Parser {
	public static parseFormURLEncodedBody<T>(
		body: string,
		isBase64Encoded: boolean,
		key: string
	): [T, string] {
		try {
			const uriComponent = isBase64Encoded ? Buffer.from(body, 'base64').toString() : body;

			const targetString = decodeURIComponent(uriComponent).split(key)[1].substring(1);

			return [JSON.parse(targetString), uriComponent];
		} catch {
			throw new IllegalArgumentError('Invalid body shape provided');
		}
	}

	public static parseAPIGatewayBody<T>(body: string, isBase64Encoded: boolean): T {
		try {
			if (!isBase64Encoded) return JSON.parse(body);

			return JSON.parse(Buffer.from(body, 'base64').toString());
		} catch (error) {
			console.error(`Cannot parse API Gateway body with value ${body}`, error);
			throw new IllegalBodyError('Invalid body shape provided');
		}
	}
}
