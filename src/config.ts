class Config {
	public static DOMAIN_NAME: string = 'isdelta.com'; // This is the domain name that you have registered and hosted on Route 53,
	public static AUTH_DOMAIN_NAME: string = `auth.${Config.DOMAIN_NAME}`; // Must be a subdomain of DOMAIN_NAME
	public static APP_DOMAIN_NAME: string = `app.${Config.DOMAIN_NAME}`; // Must be a subdomain of DOMAIN_NAME
	public static BI_DOMAIN_NAME: string = `bi.${Config.DOMAIN_NAME}`; // Must be a subdomain of DOMAIN_NAME
	public static API_GATEWAY_DOMAIN_NAME: string = `api.${Config.DOMAIN_NAME}`;

	public static NOREPLY_EMAIL: string = `no-reply@${Config.DOMAIN_NAME}`;
	public static NOREPLY_EMAIL_NAME: string = 'IsDelta';
	public static CONTACT_EMAIL: string = `contact@${Config.DOMAIN_NAME}`;

	public static APPLICATION_LOGIN_URL_CALLBACKS: string[] = [
		'http://localhost:5173/login-callback',
		`https://${Config.APP_DOMAIN_NAME}/login-callback`
	];

	public static APPLICATION_LOGOUT_URL_CALLBACKS: string[] = [
		'http://localhost:5173/login-callback',
		`https://${Config.APP_DOMAIN_NAME}/login-callback`
	];

	public static BI_API_URL: string = `https://${Config.BI_DOMAIN_NAME}`;
	public static BI_EMBED_ENCODE_SECRET: string =
		'55ff965c97be0be75a6208d62d9593ef7402365988cb5f0f63ccad11bfa0f66c';
	public static BI_EMBED_URL_EXPIRATION_IN_MINUTES: number = 60;
}

export const $config = Config;
