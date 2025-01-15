import axios, { Axios } from 'axios';
import {
	GenericExtractedData,
	LawsuitDataUpdateClient,
	LawsuitSubscriptionExternalResponse,
	UnsyncedLawsuitSubscription,
	UpdatedLawsuitData
} from '../../../domain/services/lawsuitDataUpdateClient';
import { $config } from '$config';

export class LawsuitDataUpdateClientImp implements LawsuitDataUpdateClient {
	private client: Axios;

	constructor() {
		this.client = axios.create({
			timeout: $config.AXIOS_REQUEST_TIMEOUT_SECONDS * 1000
		});
	}

	public async getLawsuitSubscriptionMetadataByCnj(
		cnj: string
	): Promise<LawsuitSubscriptionExternalResponse | undefined> {
		const accessToken = await this.getAccessToken();

		const url = new URL($config.PIPED_API_BASE_URL);
		url.pathname = '/v1/subscriptions';

		const headers = {
			Authorization: `Bearer ${accessToken}`
		};

		try {
			const { data } = await this.client.get(url.toString(), { headers });

			const lawsuitSubscription = data.data.find(
				(subscription: LawsuitSubscriptionExternalResponse) =>
					subscription.value.replace(/\D/g, '') === cnj
			);

			return lawsuitSubscription;
		} catch (error) {
			console.error(`Error retrieving lawsuit subscription metadata for CNJ ${cnj}`, error);
			throw error;
		}
	}

	public async getLawsuitSubscriptionMetadataById(
		id: string
	): Promise<LawsuitSubscriptionExternalResponse> {
		const accessToken = await this.getAccessToken();

		const url = new URL($config.PIPED_API_BASE_URL);
		url.pathname = `/v1/subscriptions/${id}`;

		const headers = {
			Authorization: `Bearer ${accessToken}`
		};

		try {
			const { data } = await this.client.get(url.toString(), { headers });

			return data.data;
		} catch (error) {
			console.error(`Error retrieving lawsuit subscription metadata for id ${id}`, error);
			throw error;
		}
	}

	public async createLawsuitSubscription(cnj: string): Promise<void> {
		const accessToken = await this.getAccessToken();

		const url = new URL($config.PIPED_API_BASE_URL);
		url.pathname = '/v1/subscriptions';

		const payload = {
			type: 'cnj',
			value: cnj
		};

		const headers = {
			Authorization: `Bearer ${accessToken}`
		};

		try {
			await this.client.post(url.toString(), payload, { headers });
		} catch (error) {
			console.error(`Error creating lawsuit subscription for CNJ ${cnj}`, error);
			throw error;
		}
	}

	public async getUpdatedLawsuitData(subscriptionId: string): Promise<UpdatedLawsuitData> {
		const accessToken = await this.getAccessToken();

		const url = new URL($config.PIPED_API_BASE_URL);
		url.pathname = `/v1/subscriptions/${subscriptionId}/data`;

		const headers = {
			Authorization: `Bearer ${accessToken}`
		};

		try {
			const { data } = await this.client.get(url.toString(), { headers });

			const urlConfirmSynced = new URL($config.PIPED_API_BASE_URL);
			urlConfirmSynced.pathname = `/v1/subscriptions/${subscriptionId}/sync`;
			await this.client.get(urlConfirmSynced.toString(), { headers });
			await this.client.post(urlConfirmSynced.toString(), {}, { headers });

			const documentsUrls: string[] = data.data.map(
				(source: GenericExtractedData) => source.download ?? undefined
			);

			return { updatedData: data.data, documentsUrls };
		} catch (error) {
			console.error(
				`Error retrieving updated lawsuit data for subscription ${subscriptionId}`,
				error
			);
			throw error;
		}
	}

	public async getUnsyncedLawsuitsSubscriptions(): Promise<UnsyncedLawsuitSubscription[]> {
		const accessToken = await this.getAccessToken();

		const url = new URL($config.PIPED_API_BASE_URL);
		url.pathname = '/v1/subscriptions/unsynced';

		const headers = {
			Authorization: `Bearer ${accessToken}`
		};

		try {
			const { data } = await this.client.get(url.toString(), { headers });

			return data.data;
		} catch (error) {
			console.error('Error retrieving unsynced lawsuits', error);
			throw error;
		}
	}

	private async getAccessToken(): Promise<string> {
		const url = new URL($config.PIPED_API_AUTH_URL);
		url.pathname = '/oauth/token';

		const payload = {
			grant_type: 'client_credentials',
			scope: 'write:api read:api',
			id: $config.PIPED_API_CLIENT_ID,
			secret: $config.PIPED_API_CLIENT_SECRET
		};

		const { data } = await this.client.post(url.toString(), payload);

		return data.access_token;
	}
}
