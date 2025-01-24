class Config {
	public static AXIOS_REQUEST_TIMEOUT_SECONDS: number = 900;

	public static DOMAIN_NAME: string = 'usedeltaai.com'; // This is the domain name that you have registered and hosted on Route 53,
	public static OTHERS_DOMAIN_NAME: string[] = ['isdelta.com'];

	public static AUTH_DOMAIN_NAME: string = `auth.${Config.DOMAIN_NAME}`; // Must be a subdomain of DOMAIN_NAME
	public static APP_DOMAIN_NAME: string = `app.${Config.DOMAIN_NAME}`; // Must be a subdomain of DOMAIN_NAME
	public static BI_DOMAIN_NAME: string = `bi.${Config.DOMAIN_NAME}`; // Must be a subdomain of DOMAIN_NAME
	public static API_GATEWAY_DOMAIN_NAME: string = `api.${Config.DOMAIN_NAME}`;

	public static NOREPLY_EMAIL: string = `no-reply@${Config.DOMAIN_NAME}`;
	public static NOREPLY_EMAIL_NAME: string = 'Delta AI';
	public static CONTACT_EMAIL: string = `contato@${Config.DOMAIN_NAME}`;

	public static APPLICATION_LOGIN_URL_CALLBACKS: string[] = [
		'http://localhost:5173/login-callback',
		`https://${Config.APP_DOMAIN_NAME}/login-callback`
	];

	public static APPLICATION_LOGOUT_URL_CALLBACKS: string[] = [
		'http://localhost:5173/login-callback',
		`https://${Config.APP_DOMAIN_NAME}/login-callback`
	];

	public static APPLICATION_ORIGINS: string[] = [
		'http://localhost:5173',
		`https://${Config.APP_DOMAIN_NAME}`
	];

	public static BI_API_URL: string = `https://${Config.BI_DOMAIN_NAME}`;
	public static BI_API_KEY: string = 'mb_qUVcSwZ6d0R9RjPu20cAUFDRHjiWs/8pxRkLXcEuEKM=';
	public static BI_EMBED_ENCODE_SECRET: string =
		'55ff965c97be0be75a6208d62d9593ef7402365988cb5f0f63ccad11bfa0f66c';
	public static BI_EMBED_URL_EXPIRATION_IN_MINUTES: number = 60;

	public static ERROR_NOTIFICATION_EMAIL: string = `tecnologia@${Config.DOMAIN_NAME}`;

	public static DATA_EXTRACTION_EVENTS_TABLE_NAME: string = 'extraction_events';
	public static DATA_EXTRACTION_BUCKET_NAME: string = 'delta-ai-extraction-data';

	public static PIPED_API_AUTH_URL: string = 'https://auth.piped.com.br';
	public static PIPED_API_CLIENT_ID: string = '0FBD737E4DA2725C'; // TO DO: move to secrets
	public static PIPED_API_CLIENT_SECRET: string = '4ff194c96b1e4fc269429c96e87a6cfa';
	public static PIPED_API_BASE_URL: string = 'https://api.piped.com.br';

	public static BRIGHDATA_API_URL: string = 'https://api.brightdata.com';
	public static BRIGHDATA_API_KEY: string =
		'89aada210ec53f7e34492c0d7caf04cfe56dbd26b06dd58a05620a70fd5eaa9d';
	public static LINKEDIN_EXTRACTION_API_DATASET_ID: string = 'gd_l1viktl72bvl7bjuj0';
	public static LINKEDIN_EXTRACTION_API_NOTIFY_URL: string = `https://${Config.API_GATEWAY_DOMAIN_NAME}/data-extraction/linkedin-extraction/notify`;
	public static LINKEDIN_EXTRACTION_WEBHOOK_AUTHORIZATION: string =
		'a12b34c56d78e90f12g34h56i78j90k12l34m56n78o90p12q34r56s78t90u12v34w56x78y90z';
	public static LINKEDIN_EXTRACTION_MAX_TIME_WINDOW_DAYS: number = 90;

	public static ESCAVADOR_API_URL: string = 'https://api.escavador.com';
	public static ESCAVADOR_API_KEY: string =
		'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMmU4M2M0MjMzY2I2Mzg2YThhYzViY2MzOWE0ZjQyOTdlY2FiMGQ3ODljM2I3MWQyOTkzNTIyOGJiZjA5ZjlhNjRkMDY2NmExZjE2MjVmOTciLCJpYXQiOjE3MzY0MzMxOTQuNzU3NjIsIm5iZiI6MTczNjQzMzE5NC43NTc2MjMsImV4cCI6MjA1MTk2NTk5NC43NTI5NDYsInN1YiI6IjIxMzcwNjMiLCJzY29wZXMiOlsiYWNlc3Nhcl9hcGlfcGFnYSJdfQ.syZXCuO-19Dieo-vAnP0X6GmQPLpjq8D84TxPgVfc4VKj3J167VKFz4oxfaj3VaUB6YhvFNjAZYJV-KQ-tMESDjBOqP4rijiXcBEcHuJjhX2kh2U-cNAhL-zESXCJ980Lo_rVZxqRONOcTlHer6Up0D7GcYNl_yxT7jl7v7MU-N1Z0_OdkHU_egUoRNwSv-Hsy9dJFiJu8iO-oS7OglZ2pxDSgY1_OtjPA7M8DiiRS-M1xLNb7w5f1iIUdnxFssbqG0caJLhfkfGpF4zLLBOHmkCWB2Z9kqvQ1qQQr0OpQNMWTtiY9Mz5vTSObBCv8Z-qikrM-WiKd0LtEk9Bpa_7Fj0XJGc-bUNa7UPfJv1Ze8rBjWWMZPLqhcIu3M8P-ucE7h4ttyluSjYRPp4meFnwS1Sb8NTvJc2ok6ovvhOdHRUapsc3-XujL9T4dJaRJMhTI75uvoQXJZ_9cPLJ6LRnkMrL952P4lAgmPLYYi89UcqeW0FJp4jNM8u3rmGjPUd9OZA7yEV0Rt9AH6y7R8vyv1of_RrlPh_SlUEhhxvpoiRpygQ2cvfyo-e9MWvOXfnVTeDeLAQzmsm5avttgQwyO1hRUBidsQXRh5VI4ACFPY83bq0k3LkUEepJBG5V7v8FEMTvL0o5maCB2cuklgDKtOb93NJJfvDLmNqZByRiWg';
	public static ESCAVADOR_EXTRACTION_MAX_TIME_WINDOW_DAYS: number = 7;
}

export const $config = Config;
