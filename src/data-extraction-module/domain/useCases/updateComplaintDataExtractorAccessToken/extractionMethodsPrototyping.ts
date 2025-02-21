async function getAccessToken(refresh_token: string) {
	const response = await fetch(
		'https://auth.reclameaqui.com.br/auth/realms/reclameaqui-company/protocol/openid-connect/token',
		{
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
			body: `grant_type=refresh_token&refresh_token=${refresh_token}&client_id=sitepublico`
		}
	);

	console.log('status: ', response.status);
	console.log('statusText: ', response.statusText);

	try {
		const json = await response.json();
		return json;
	} catch (error) {
		console.error('Invalid json');
	}
}

async function listReclamacoes(access_token: string) {
	const response = await fetch(
		'https://iosearch.reclameaqui.com.br/raichu-io-site-search-v1/complains/company?offset=10&company=zP9qM42BE-BG3I_e&order=created&orderType=desc',
		{
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
				Authorization: `Bearer ${access_token}`
			}
		}
	);

	console.log('status: ', response.status);
	console.log('statusText: ', response.statusText);

	try {
		const json = await response.json();
		return json;
	} catch (error) {
		console.error('Invalid json');
	}
}

async function getReclamacao(id: string, access_token: string) {
	const response = await fetch(
		`https://iosite.reclameaqui.com.br/raichu-io-site-v1/complain/company/${id}`,
		{
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
				Authorization: `Bearer ${access_token}`
			}
		}
	);

	console.log('status: ', response.status);
	console.log('statusText: ', response.statusText);

	try {
		const json = await response.json();
		return json;
	} catch (error) {
		console.error('Invalid json');
	}
}

async function getCompanyInformation(id: string, access_token: string) {
	const response = await fetch(
		`https://iosite.reclameaqui.com.br/raichu-io-site-v1/company/private/${id}`,
		{
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
				Authorization: `Bearer ${access_token}`
			}
		}
	);

	console.log('status: ', response.status);
	console.log('statusText: ', response.statusText);

	try {
		const json = await response.json();
		return json;
	} catch (error) {
		console.error('Invalid json');
	}
}

async function getCompanyMetadata(access_token: string) {
	const response = await fetch('https://www.reclameaqui.com.br/auth/user-info', {
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
		body: JSON.stringify({ realm: 'reclameaqui-company', token: access_token })
	});

	console.log('status: ', response.status);
	console.log('statusText: ', response.statusText);

	try {
		const json = await response.json();
		return json;
	} catch (error) {
		console.error('Invalid json');
	}
}

// getAccessToken(
// 	'eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICIyOTBmMmZhMC02ZGQ1LTRhNmQtYmRkMC02NWMxN2E2OGNmMjAifQ.eyJleHAiOjE3NDAxNjE1MzgsImlhdCI6MTc0MDE1NzkzOCwianRpIjoiNTQ1N2ZhY2MtNDEzMC00YTcxLTk2YjctOTJjYjY1YjA5NGRjIiwiaXNzIjoiaHR0cHM6Ly9hdXRoLnJlY2xhbWVhcXVpLmNvbS5ici9hdXRoL3JlYWxtcy9yZWNsYW1lYXF1aS1jb21wYW55IiwiYXVkIjoiaHR0cHM6Ly9hdXRoLnJlY2xhbWVhcXVpLmNvbS5ici9hdXRoL3JlYWxtcy9yZWNsYW1lYXF1aS1jb21wYW55Iiwic3ViIjoiZjphN2VkYzA1Yy02MzNkLTQ0YzItYWRiYi0xMjVlZWMwOWQ2ODU6cVV5aERWMHoxczNEdXhLQyIsInR5cCI6IlJlZnJlc2giLCJhenAiOiJzaXRlcHVibGljbyIsInNlc3Npb25fc3RhdGUiOiJkNDdiMTU1ZC0zNmVlLTQ3MmMtYTk4Yy1jZThlYTNiYzJkMGUiLCJzY29wZSI6Im9wZW5pZCIsInNpZCI6ImQ0N2IxNTVkLTM2ZWUtNDcyYy1hOThjLWNlOGVhM2JjMmQwZSJ9.PKRxGD1WxWEc46-PxeXy3xvaK66Kv4DcPI2R1F48_jk'
// ).then(console.log);

// listReclamacoes(
// 	'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOMjZkZXJtRXFoRFZ2TVptSDE2ZXM2VVJJZW9QQXB2TFpZNDM2Q0hlZkZvIn0.eyJleHAiOjE3NDAxNTk3NjAsImlhdCI6MTc0MDE1Nzk2MCwianRpIjoiYmQ2MzA0NWMtMGI3OC00MzgyLTgzNWUtNmRkODljOWU2NzhlIiwiaXNzIjoiaHR0cHM6Ly9hdXRoLnJlY2xhbWVhcXVpLmNvbS5ici9hdXRoL3JlYWxtcy9yZWNsYW1lYXF1aS1jb21wYW55IiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImY6YTdlZGMwNWMtNjMzZC00NGMyLWFkYmItMTI1ZWVjMDlkNjg1OnFVeWhEVjB6MXMzRHV4S0MiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzaXRlcHVibGljbyIsInNlc3Npb25fc3RhdGUiOiJkNDdiMTU1ZC0zNmVlLTQ3MmMtYTk4Yy1jZThlYTNiYzJkMGUiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cHM6Ly9wcmVtaW8ucmVjbGFtZWFxdWkuY29tLmJyIiwiaHR0cHM6Ly9yZWNsYW1lYXF1aS5jb20uYnIiLCJodHRwOi8vY2hlY2tvdXQucmVjbGFtZWFxdWkuY29tLmJyIiwiaHR0cHM6Ly93cHBiZXRhLm9idmlvc3RhZ2luZy5jb20uYnIiLCJodHRwczovL2lvc2VhcmNoLnJlY2xhbWVhcXVpLmNvbS5iciIsImh0dHA6Ly9yZWNsYW1lYXF1aS5jb20uYnIiLCJodHRwczovL3d3dy5yZWNsYW1lYXF1aS5jb20uYnIiLCJodHRwczovL2NoZWNrb3V0LnJlY2xhbWVhcXVpLmNvbS5iciIsImh0dHA6Ly93d3cucmVjbGFtZWFxdWkuY29tLmJyIiwiaHR0cHM6Ly9pb3NpdGUucmVjbGFtZWFxdWkuY29tLmJyIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImNvbXBhbnkiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIiwic2lkIjoiZDQ3YjE1NWQtMzZlZS00NzJjLWE5OGMtY2U4ZWEzYmMyZDBlIiwiY29tcGFuaWVzIjpbInpQOXFNNDJCRS1CRzNJX2UiXSwibmFtZSI6IkZPUlVNIEhVQiIsImZpbmdlcnByaW50IjoiMWEyOGU2OTAxNjc2NWQ5MmUzYjM4MTE2OGQ2ODkyMmMiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJmb3J1bWh1YiIsIm1pZ3JhdGVkIjpmYWxzZSwiZ2l2ZW5fbmFtZSI6IkZPUlVNIiwidXNlcklkIjoicVV5aERWMHoxczNEdXhLQyIsImZhbWlseV9uYW1lIjoiSFVCIiwiZW1haWwiOiJmb3J1bWh1YiJ9.a5IHlJv9FsK2lGrsBtlCUpbWy38kJEv58oo-5RCQMcr5IodAeFjXlNOzYKO0fjQBmOg4tIOO6-7hpXr8CazMJwlqZZYJi-zx6a44_BO8bSkJleJdYAXpronjHvSrIhsbgs9_Il3FddpRxysm4Esvy0xWHlf1NK46G8nbFrq_g5nw7Pv72wUGIY_wo2eKCl1WCYMn4l306TylIYCjd4m64vaOoGirGuomhbwrWsns833L7kKyxGTmITObb3oh1UuJ01ZH_eXiWAAsVtmz8smizNVdxD7UHE-r3v82W2cAOyFovt16HENIQHWBuJmsYY8vMZ7do0maepL8uF16Q1F37A'
// ).then(console.log);

// getReclamacao(
// 	'dPAHCLR2oA39VFsN',
// 	'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOMjZkZXJtRXFoRFZ2TVptSDE2ZXM2VVJJZW9QQXB2TFpZNDM2Q0hlZkZvIn0.eyJleHAiOjE3NDAxNTk3NjAsImlhdCI6MTc0MDE1Nzk2MCwianRpIjoiYmQ2MzA0NWMtMGI3OC00MzgyLTgzNWUtNmRkODljOWU2NzhlIiwiaXNzIjoiaHR0cHM6Ly9hdXRoLnJlY2xhbWVhcXVpLmNvbS5ici9hdXRoL3JlYWxtcy9yZWNsYW1lYXF1aS1jb21wYW55IiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImY6YTdlZGMwNWMtNjMzZC00NGMyLWFkYmItMTI1ZWVjMDlkNjg1OnFVeWhEVjB6MXMzRHV4S0MiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzaXRlcHVibGljbyIsInNlc3Npb25fc3RhdGUiOiJkNDdiMTU1ZC0zNmVlLTQ3MmMtYTk4Yy1jZThlYTNiYzJkMGUiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cHM6Ly9wcmVtaW8ucmVjbGFtZWFxdWkuY29tLmJyIiwiaHR0cHM6Ly9yZWNsYW1lYXF1aS5jb20uYnIiLCJodHRwOi8vY2hlY2tvdXQucmVjbGFtZWFxdWkuY29tLmJyIiwiaHR0cHM6Ly93cHBiZXRhLm9idmlvc3RhZ2luZy5jb20uYnIiLCJodHRwczovL2lvc2VhcmNoLnJlY2xhbWVhcXVpLmNvbS5iciIsImh0dHA6Ly9yZWNsYW1lYXF1aS5jb20uYnIiLCJodHRwczovL3d3dy5yZWNsYW1lYXF1aS5jb20uYnIiLCJodHRwczovL2NoZWNrb3V0LnJlY2xhbWVhcXVpLmNvbS5iciIsImh0dHA6Ly93d3cucmVjbGFtZWFxdWkuY29tLmJyIiwiaHR0cHM6Ly9pb3NpdGUucmVjbGFtZWFxdWkuY29tLmJyIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImNvbXBhbnkiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIiwic2lkIjoiZDQ3YjE1NWQtMzZlZS00NzJjLWE5OGMtY2U4ZWEzYmMyZDBlIiwiY29tcGFuaWVzIjpbInpQOXFNNDJCRS1CRzNJX2UiXSwibmFtZSI6IkZPUlVNIEhVQiIsImZpbmdlcnByaW50IjoiMWEyOGU2OTAxNjc2NWQ5MmUzYjM4MTE2OGQ2ODkyMmMiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJmb3J1bWh1YiIsIm1pZ3JhdGVkIjpmYWxzZSwiZ2l2ZW5fbmFtZSI6IkZPUlVNIiwidXNlcklkIjoicVV5aERWMHoxczNEdXhLQyIsImZhbWlseV9uYW1lIjoiSFVCIiwiZW1haWwiOiJmb3J1bWh1YiJ9.a5IHlJv9FsK2lGrsBtlCUpbWy38kJEv58oo-5RCQMcr5IodAeFjXlNOzYKO0fjQBmOg4tIOO6-7hpXr8CazMJwlqZZYJi-zx6a44_BO8bSkJleJdYAXpronjHvSrIhsbgs9_Il3FddpRxysm4Esvy0xWHlf1NK46G8nbFrq_g5nw7Pv72wUGIY_wo2eKCl1WCYMn4l306TylIYCjd4m64vaOoGirGuomhbwrWsns833L7kKyxGTmITObb3oh1UuJ01ZH_eXiWAAsVtmz8smizNVdxD7UHE-r3v82W2cAOyFovt16HENIQHWBuJmsYY8vMZ7do0maepL8uF16Q1F37A'
// ).then(console.log);

// getCompanyInformation(
// 	'zP9qM42BE-BG3I_e',
// 	'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOMjZkZXJtRXFoRFZ2TVptSDE2ZXM2VVJJZW9QQXB2TFpZNDM2Q0hlZkZvIn0.eyJleHAiOjE3NDAxNDI4NjMsImlhdCI6MTc0MDE0MTA2MywianRpIjoiZWJjYWY0ZjEtMzhkOS00ZGUzLTk0MmEtOTc5ZTJlMGQ0YTI2IiwiaXNzIjoiaHR0cHM6Ly9hdXRoLnJlY2xhbWVhcXVpLmNvbS5ici9hdXRoL3JlYWxtcy9yZWNsYW1lYXF1aS1jb21wYW55IiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImY6YTdlZGMwNWMtNjMzZC00NGMyLWFkYmItMTI1ZWVjMDlkNjg1OnFVeWhEVjB6MXMzRHV4S0MiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzaXRlcHVibGljbyIsInNlc3Npb25fc3RhdGUiOiIwNjMwODU2MS1hNWIzLTQ3ZTMtOGU5Yi03Yzg4NTRiODVkZjQiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cHM6Ly9wcmVtaW8ucmVjbGFtZWFxdWkuY29tLmJyIiwiaHR0cHM6Ly9yZWNsYW1lYXF1aS5jb20uYnIiLCJodHRwOi8vY2hlY2tvdXQucmVjbGFtZWFxdWkuY29tLmJyIiwiaHR0cHM6Ly93cHBiZXRhLm9idmlvc3RhZ2luZy5jb20uYnIiLCJodHRwczovL2lvc2VhcmNoLnJlY2xhbWVhcXVpLmNvbS5iciIsImh0dHA6Ly9yZWNsYW1lYXF1aS5jb20uYnIiLCJodHRwczovL3d3dy5yZWNsYW1lYXF1aS5jb20uYnIiLCJodHRwczovL2NoZWNrb3V0LnJlY2xhbWVhcXVpLmNvbS5iciIsImh0dHA6Ly93d3cucmVjbGFtZWFxdWkuY29tLmJyIiwiaHR0cHM6Ly9pb3NpdGUucmVjbGFtZWFxdWkuY29tLmJyIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImNvbXBhbnkiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIiwic2lkIjoiMDYzMDg1NjEtYTViMy00N2UzLThlOWItN2M4ODU0Yjg1ZGY0IiwiY29tcGFuaWVzIjpbInpQOXFNNDJCRS1CRzNJX2UiXSwibmFtZSI6IkZPUlVNIEhVQiIsImZpbmdlcnByaW50IjoiMWEyOGU2OTAxNjc2NWQ5MmUzYjM4MTE2OGQ2ODkyMmMiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJmb3J1bWh1YiIsIm1pZ3JhdGVkIjpmYWxzZSwiZ2l2ZW5fbmFtZSI6IkZPUlVNIiwidXNlcklkIjoicVV5aERWMHoxczNEdXhLQyIsImZhbWlseV9uYW1lIjoiSFVCIiwiZW1haWwiOiJmb3J1bWh1YiJ9.aNeI5F0cE8_WehRSSwJlP0T5tYiDxEo2XQzshvA0GSxALOAxmwNx3qv-0SeereQECRJzCmt5zzEBKLxLa6Vs8JVrR06TfTWqaGH37If0l41QyI_V-kL4fEHfFHAMnALWBFN4l4e7UDIg7olNV2anXNbUPfUrMNHpcUxMsCaHOPb0mhizec9gYPCvX9wxzxyKhMJNvZ-LNEnCD90GdZmjdOK7okSCB7ig4R75bnjYIZj3sA6_HKTtCGXAUjiGP0wlmtq3yiy0ojcUiDQFbr1XLLHrV_779aXcYqGfNRSTEpOWKeO4MMAFJ1F4w9XtAI6z8gM6osN9Mo2EYwRiGAjPew'
// ).then(console.log);

// getCompanyMetadata(
// 	'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJOMjZkZXJtRXFoRFZ2TVptSDE2ZXM2VVJJZW9QQXB2TFpZNDM2Q0hlZkZvIn0.eyJleHAiOjE3NDAxNDI4NjMsImlhdCI6MTc0MDE0MTA2MywianRpIjoiZWJjYWY0ZjEtMzhkOS00ZGUzLTk0MmEtOTc5ZTJlMGQ0YTI2IiwiaXNzIjoiaHR0cHM6Ly9hdXRoLnJlY2xhbWVhcXVpLmNvbS5ici9hdXRoL3JlYWxtcy9yZWNsYW1lYXF1aS1jb21wYW55IiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImY6YTdlZGMwNWMtNjMzZC00NGMyLWFkYmItMTI1ZWVjMDlkNjg1OnFVeWhEVjB6MXMzRHV4S0MiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzaXRlcHVibGljbyIsInNlc3Npb25fc3RhdGUiOiIwNjMwODU2MS1hNWIzLTQ3ZTMtOGU5Yi03Yzg4NTRiODVkZjQiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cHM6Ly9wcmVtaW8ucmVjbGFtZWFxdWkuY29tLmJyIiwiaHR0cHM6Ly9yZWNsYW1lYXF1aS5jb20uYnIiLCJodHRwOi8vY2hlY2tvdXQucmVjbGFtZWFxdWkuY29tLmJyIiwiaHR0cHM6Ly93cHBiZXRhLm9idmlvc3RhZ2luZy5jb20uYnIiLCJodHRwczovL2lvc2VhcmNoLnJlY2xhbWVhcXVpLmNvbS5iciIsImh0dHA6Ly9yZWNsYW1lYXF1aS5jb20uYnIiLCJodHRwczovL3d3dy5yZWNsYW1lYXF1aS5jb20uYnIiLCJodHRwczovL2NoZWNrb3V0LnJlY2xhbWVhcXVpLmNvbS5iciIsImh0dHA6Ly93d3cucmVjbGFtZWFxdWkuY29tLmJyIiwiaHR0cHM6Ly9pb3NpdGUucmVjbGFtZWFxdWkuY29tLmJyIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsImNvbXBhbnkiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIiwic2lkIjoiMDYzMDg1NjEtYTViMy00N2UzLThlOWItN2M4ODU0Yjg1ZGY0IiwiY29tcGFuaWVzIjpbInpQOXFNNDJCRS1CRzNJX2UiXSwibmFtZSI6IkZPUlVNIEhVQiIsImZpbmdlcnByaW50IjoiMWEyOGU2OTAxNjc2NWQ5MmUzYjM4MTE2OGQ2ODkyMmMiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJmb3J1bWh1YiIsIm1pZ3JhdGVkIjpmYWxzZSwiZ2l2ZW5fbmFtZSI6IkZPUlVNIiwidXNlcklkIjoicVV5aERWMHoxczNEdXhLQyIsImZhbWlseV9uYW1lIjoiSFVCIiwiZW1haWwiOiJmb3J1bWh1YiJ9.aNeI5F0cE8_WehRSSwJlP0T5tYiDxEo2XQzshvA0GSxALOAxmwNx3qv-0SeereQECRJzCmt5zzEBKLxLa6Vs8JVrR06TfTWqaGH37If0l41QyI_V-kL4fEHfFHAMnALWBFN4l4e7UDIg7olNV2anXNbUPfUrMNHpcUxMsCaHOPb0mhizec9gYPCvX9wxzxyKhMJNvZ-LNEnCD90GdZmjdOK7okSCB7ig4R75bnjYIZj3sA6_HKTtCGXAUjiGP0wlmtq3yiy0ojcUiDQFbr1XLLHrV_779aXcYqGfNRSTEpOWKeO4MMAFJ1F4w9XtAI6z8gM6osN9Mo2EYwRiGAjPew'
// ).then(console.log);
