// import { $config } from '$config';
import {
	ComplaintsDataExtractorClient,
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
}
