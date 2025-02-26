// import { $config } from '$config';
import {
	CompanyAdditionalMetadata,
	CompanyBasicMetadata,
	CompanyMetadata,
	ComplaintBasicData,
	ComplaintFullData,
	ComplaintsDataExtractorClient,
	GetComplaintsResponse,
	InteractionsAttributes,
	TokenResponse
} from '../../../domain/services/complaintsDataExtractorClient';

export class ComplaintsDataExtractorClientImp implements ComplaintsDataExtractorClient {
	public async getAccessToken(refreshToken: string): Promise<string> {
		try {
			// const url = new URL($config.RECLAME_AQUI_AUTH_BASE_URL);
			const url = new URL('https://auth.reclameaqui.com.br');
			url.pathname = '/auth/realms/reclameaqui-company/protocol/openid-connect/token';

			const response = await fetch(url.toString(), {
				method: 'POST',
				headers: {
					accept: '*/*',
					'accept-language': 'en-US,en;q=0.9,pt;q=0.8',
					'cache-control': 'no-cache',
					'content-type': 'application/x-www-form-urlencoded',
					pragma: 'no-cache',
					priority: 'u=1, i',
					'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
					'sec-ch-ua-mobile': '?0',
					'sec-ch-ua-platform': '"Linux"',
					'sec-fetch-dest': 'empty',
					'sec-fetch-mode': 'cors',
					'sec-fetch-site': 'same-site',
					Referer: 'https://www.reclameaqui.com.br/',
					'Referrer-Policy': 'strict-origin-when-cross-origin',
					Host: 'www.reclameaqui.com.br',
					Origin: 'https://www.reclameaqui.com.br'
				},
				body: `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=sitepublico`
			});

			const data: TokenResponse = await response.json();

			return data.access_token;
		} catch (error) {
			console.error('Error updating token from Reclame Aqui', error);
			throw error;
		}
	}

	public async getCompanyMetadata(accessToken: string): Promise<CompanyMetadata> {
		const companyMetadata: CompanyMetadata = {
			cnpj: '',
			companyName: '',
			companyExternalId: ''
		};
		try {
			// const urlBasicMetadata = new URL($config.RECLAME_AQUI_DOMAIN_URL);
			const urlBasicMetadata = new URL('https://www.reclameaqui.com.br');
			urlBasicMetadata.pathname = '/auth/user-info';

			const responseRaw = await fetch(urlBasicMetadata.toString(), {
				method: 'POST',
				headers: {
					accept: '*/*',
					'accept-language': 'en-US,en;q=0.9,pt;q=0.8',
					'cache-control': 'no-cache',
					'content-type': 'application/json',
					pragma: 'no-cache',
					priority: 'u=1, i',
					'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
					'sec-ch-ua-mobile': '?0',
					'sec-ch-ua-platform': '"Linux"',
					'sec-fetch-dest': 'empty',
					'sec-fetch-mode': 'cors',
					'sec-fetch-site': 'same-site',
					Referer: 'https://www.reclameaqui.com.br/',
					'Referrer-Policy': 'strict-origin-when-cross-origin',
					Host: 'www.reclameaqui.com.br',
					Origin: 'https://www.reclameaqui.com.br'
				},
				body: JSON.stringify({ realm: 'reclameaqui-company', token: accessToken })
			});

			const basicData: CompanyBasicMetadata = await responseRaw.json();
			companyMetadata.companyExternalId = basicData.companies[0];
			companyMetadata.companyName = basicData.name;
		} catch (error) {
			console.error('Error getting company basic metadata from Reclame Aqui', error);
			throw error;
		}

		try {
			// const additionalMetadataUrl = new URL($config.RECLAME_AQUI_API_BASE_URL);
			const additionalMetadataUrl = new URL('https://iosite.reclameaqui.com.br');
			additionalMetadataUrl.pathname = `/raichu-io-site-v1/company/private/${companyMetadata.companyExternalId}`;

			const responseRaw = await fetch(additionalMetadataUrl.toString(), {
				method: 'GET',
				headers: {
					accept: 'application/json, text/plain, */*',
					'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
					'cache-control': 'no-cache',
					'company-id': 'zP9qM42BE-BG3I_e',
					pragma: 'no-cache',
					priority: 'u=1, i',
					realm: 'reclameaqui-company',
					'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
					'sec-ch-ua-mobile': '?0',
					'sec-ch-ua-platform': '"Linux"',
					'sec-fetch-dest': 'empty',
					'sec-fetch-mode': 'cors',
					'sec-fetch-site': 'same-site',
					Referer: 'https://www.reclameaqui.com.br/',
					'Referrer-Policy': 'strict-origin-when-cross-origin',

					Host: 'www.reclameaqui.com.br',
					Origin: 'https://www.reclameaqui.com.br',
					Authorization: `Bearer ${accessToken}`
				}
			});

			const additionalData: CompanyAdditionalMetadata = await responseRaw.json();
			companyMetadata.cnpj = additionalData.documents[0].number;
		} catch (error) {
			console.error('Error getting company additional metadata from Reclame Aqui', error);
			throw error;
		}

		return companyMetadata;
	}

	public async getComplaints(
		companyExternalId: string,
		accessToken: string
	): Promise<ComplaintBasicData[]> {
		let nextPage: string | undefined;
		try {
			// const url = new URL($config.RECLAME_AQUI_SEARCH _URL);
			const url = new URL('https://iosearch.reclameaqui.com.br');
			url.pathname = '/raichu-io-site-search-v1/complains/company';
			url.searchParams.append('offset', '50');
			url.searchParams.append('company', companyExternalId);
			url.searchParams.append('order', 'created');
			url.searchParams.append('orderType', 'desc');

			const complaints: ComplaintBasicData[] = [];
			let hasNextPage = true;

			while (hasNextPage) {
				let responseRaw;
				if (!nextPage) {
					responseRaw = await fetch(url.toString(), {
						method: 'GET',
						headers: {
							accept: 'application/json, text/plain, */*',
							'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
							'cache-control': 'no-cache',
							'company-id': companyExternalId,
							pragma: 'no-cache',
							priority: 'u=1, i',
							realm: 'reclameaqui-company',
							'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
							'sec-ch-ua-mobile': '?0',
							'sec-ch-ua-platform': '"Linux"',
							'sec-fetch-dest': 'empty',
							'sec-fetch-mode': 'cors',
							'sec-fetch-site': 'same-site',
							Referer: 'https://www.reclameaqui.com.br/',
							'Referrer-Policy': 'strict-origin-when-cross-origin',

							Host: 'www.reclameaqui.com.br',
							Origin: 'https://www.reclameaqui.com.br',
							Authorization: `Bearer ${accessToken}`
						}
					});
				} else {
					responseRaw = await fetch(nextPage, {
						method: 'GET',
						headers: {
							Authorization: `Bearer ${accessToken}`
						}
					});
				}

				const response: GetComplaintsResponse = await responseRaw?.json();
				complaints.push(...response.data);

				if (response.next !== null) nextPage = response.next;
				else hasNextPage = false;
			}

			return complaints;
		} catch (error) {
			console.error('Error getting complaints from Reclame Aqui', error);
			throw error;
		}
	}

	public async getComplaintData(
		complaintExternalId: string,
		accessToken: string
	): Promise<ComplaintFullData> {
		try {
			// const url = new URL($config.RECLAME_AQUI_SITE_BASE_URL);
			const url = new URL('https://iosite.reclameaqui.com.br');
			url.pathname = `/raichu-io-site-v1/complain/company/${complaintExternalId}`;

			const responseRaw = await fetch(url.toString(), {
				method: 'GET',
				headers: {
					accept: 'application/json, text/plain, */*',
					'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3',
					'cache-control': 'no-cache',
					'company-id': 'zP9qM42BE-BG3I_e',
					pragma: 'no-cache',
					priority: 'u=1, i',
					realm: 'reclameaqui-company',
					'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
					'sec-ch-ua-mobile': '?0',
					'sec-ch-ua-platform': '"Linux"',
					'sec-fetch-dest': 'empty',
					'sec-fetch-mode': 'cors',
					'sec-fetch-site': 'same-site',
					Referer: 'https://www.reclameaqui.com.br/',
					'Referrer-Policy': 'strict-origin-when-cross-origin',

					Host: 'www.reclameaqui.com.br',
					Origin: 'https://www.reclameaqui.com.br',
					Authorization: `Bearer ${accessToken}`
				}
			});

			const response = await responseRaw.json();
			const complaintData: ComplaintFullData = {
				id: response.id,
				created: response.created,
				title: response.title,
				description: response.description,
				interactions: response.interactions.map((interaction: InteractionsAttributes) => ({
					created: interaction.created,
					id: interaction.id,
					message: interaction.message,
					type: interaction.type
				})),
				user: {
          id: response.user.id,
          status: response.user.status
        },
				solved: response.solved,
				dealAgain: response.dealAgain,
				evaluation: response.evaluation,
				score: response.score,
				evaluated: response.evaluated,
				hasExpired: response.hasExpired,
				status: response.status,
				phones: response.phones,
				userName: response.userName,
				userEmail: response.userEmail,
				userState: response.userState,
				userCity: response.userCity,
				complainOrigin: response.complainOrigin,
				hasReply: response.hasReply,
				compliment: response.compliment,
				company: {
					id: response.company.id
				}
			};

			return complaintData;
		} catch (error) {
			console.error('Error getting complaint data from Reclame Aqui', error);
			throw error;
		}
	}
}
