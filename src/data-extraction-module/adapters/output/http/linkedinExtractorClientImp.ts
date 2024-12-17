import { $config } from '$config';
import {
	GenericDataSetExtractionResponse,
	LinkedinExtractorClient
} from '../../../domain/services/linkedinExtractorClient';
import axios, { Axios } from 'axios';

export class LinkedinExtractorClientImp implements LinkedinExtractorClient {
	private client: Axios;

	constructor() {
		this.client = axios.create({
			timeout: $config.AXIOS_REQUEST_TIMEOUT_SECONDS * 1000
		});
	}

	public async triggerProfileExtractByName(
		profiles: { firstName: string; lastName: string }[]
	): Promise<string> {
		const url = new URL($config.BRIGHDATA_API_URL);
		url.pathname = '/datasets/v3/trigger';

		const headers = {
			Authorization: `Bearer ${$config.BRIGHDATA_API_KEY}`
		};
		const params = {
			dataset_id: $config.LINKEDIN_EXTRACTION_API_DATASET_ID,
			discover_by: 'name',
			type: 'discover_new',
			limit_per_input: 3,
			notify: $config.LINKEDIN_EXTRACTION_API_NOTIFY_URL,
			auth_header: $config.LINKEDIN_EXTRACTION_WEBHOOK_AUTHORIZATION
		};
		const payload = profiles.map((profile) => ({
			first_name: profile.firstName,
			last_name: profile.lastName
		}));

		const { data } = await this.client.post(url.toString(), payload, { headers, params });

		return data.snapshot_id;
	}

	public async getExtractedProfile(snapshotId: string): Promise<GenericDataSetExtractionResponse> {
		const url = new URL($config.BRIGHDATA_API_URL);
		url.pathname = `/datasets/v3/snapshot/${snapshotId}`;
		const headers = {
			Authorization: `Bearer ${$config.BRIGHDATA_API_KEY}`
		};
		const params = {
			format: 'json'
		};

		let response;

		try {
			response = await this.client.get(url.toString(), { headers, params });
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(
					`Error getting extracted profile. ${error.response?.status}. ${error.response?.data}`
				);
			} else {
				throw new Error(`Unexpected error: ${error}`);
			}
		}

		return response?.data;
	}
}
