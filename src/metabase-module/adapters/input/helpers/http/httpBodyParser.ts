import { APIGatewayEvent } from 'aws-lambda';
import { BadRequestError } from './httpErrors';

export class HttpBodyParser {
	public static parseFormURLEncoded<T>(
		body: string,
		isBase64Encoded: boolean,
		key: string
	): [T, string] {
		try {
			const uriComponent = isBase64Encoded ? Buffer.from(body, 'base64').toString() : body;

			const targetString = decodeURIComponent(uriComponent).split(key)[1].substring(1);

			return [JSON.parse(targetString), uriComponent];
		} catch {
			throw new BadRequestError('Invalid body shape provided');
		}
	}

	public static parseJson<T>(event: APIGatewayEvent): T {
		const body = event.body;
		const isBase64Encoded = event.isBase64Encoded;

		try {
			if (!body) throw new BadRequestError('No body provided');

			if (!isBase64Encoded) return JSON.parse(body);

			return JSON.parse(Buffer.from(body, 'base64').toString());
		} catch (error) {
			console.error(`Cannot parse API Gateway body with value ${body}`, error);
			throw new BadRequestError('Invalid body shape provided');
		}
	}
}
