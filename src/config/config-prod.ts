import { Config } from './type';

export class ConfigProd implements Config {
	public ENVIRONMENT: 'production' | 'staging' = 'production';
	public AWS_REGION: string = 'us-east-1';
	public AWS_ACCOUNT_ID: string = '225989342294';

	public AXIOS_REQUEST_TIMEOUT_SECONDS: number = 900;

	public DOMAIN_NAME: string = 'usedeltaai.com';
	public OTHERS_DOMAIN_NAME: string[] = ['isdelta.com'];

	public AUTH_DOMAIN_NAME: string = `auth.${this.DOMAIN_NAME}`;
	public APP_DOMAIN_NAME: string = `app.${this.DOMAIN_NAME}`;
	public BI_DOMAIN_NAME: string = `bi.${this.DOMAIN_NAME}`;
	public API_GATEWAY_DOMAIN_NAME: string = `api.${this.DOMAIN_NAME}`;

	public NOREPLY_EMAIL: string = `no-reply@${this.DOMAIN_NAME}`;
	public NOREPLY_EMAIL_NAME: string = 'Delta AI';
	public CONTACT_EMAIL: string = `contato@${this.DOMAIN_NAME}`;

	public APPLICATION_LOGIN_URL_CALLBACKS: string[] = [
		'http://localhost:5173/login-callback',
		`https://${this.APP_DOMAIN_NAME}/login-callback`
	];

	public APPLICATION_LOGOUT_URL_CALLBACKS: string[] = [
		'http://localhost:5173/login-callback',
		`https://${this.APP_DOMAIN_NAME}/login-callback`
	];

	public APPLICATION_ORIGINS: string[] = [
		'http://localhost:5173',
		`https://${this.APP_DOMAIN_NAME}`
	];

	public BI_API_URL: string = `https://${this.BI_DOMAIN_NAME}`;
	public BI_API_KEY: string = 'mb_qUVcSwZ6d0R9RjPu20cAUFDRHjiWs/8pxRkLXcEuEKM=';
	public BI_EMBED_ENCODE_SECRET: string =
		'55ff965c97be0be75a6208d62d9593ef7402365988cb5f0f63ccad11bfa0f66c';
	public BI_EMBED_URL_EXPIRATION_IN_MINUTES: number = 60;

	public ERROR_NOTIFICATION_EMAIL: string = `tecnologia@${this.DOMAIN_NAME}`;

	public DATA_EXTRACTION_EVENTS_TABLE_NAME: string = 'extraction_events';
	public DATA_EXTRACTION_BUCKET_NAME: string = 'delta-ai-extraction-data';

	public PIPED_API_AUTH_URL: string = 'https://auth.piped.com.br';
	public PIPED_API_CLIENT_ID: string = '0FBD737E4DA2725C'; // TO DO: move to secrets
	public PIPED_API_CLIENT_SECRET: string = '4ff194c96b1e4fc269429c96e87a6cfa';
	public PIPED_API_BASE_URL: string = 'https://api.piped.com.br';

	public BRIGHDATA_API_URL: string = 'https://api.brightdata.com';
	public BRIGHDATA_API_KEY: string =
		'89aada210ec53f7e34492c0d7caf04cfe56dbd26b06dd58a05620a70fd5eaa9d';
	public LINKEDIN_EXTRACTION_API_DATASET_ID: string = 'gd_l1viktl72bvl7bjuj0';
	public LINKEDIN_EXTRACTION_API_NOTIFY_URL: string = `https://${this.API_GATEWAY_DOMAIN_NAME}/data-extraction/linkedin-extraction/notify`;
	public LINKEDIN_EXTRACTION_WEBHOOK_AUTHORIZATION: string =
		'a12b34c56d78e90f12g34h56i78j90k12l34m56n78o90p12q34r56s78t90u12v34w56x78y90z';
	public LINKEDIN_EXTRACTION_MAX_TIME_WINDOW_DAYS: number = 90;

	public ESCAVADOR_API_URL: string = 'https://api.escavador.com';
	public ESCAVADOR_API_KEY: string =
		'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMmU4M2M0MjMzY2I2Mzg2YThhYzViY2MzOWE0ZjQyOTdlY2FiMGQ3ODljM2I3MWQyOTkzNTIyOGJiZjA5ZjlhNjRkMDY2NmExZjE2MjVmOTciLCJpYXQiOjE3MzY0MzMxOTQuNzU3NjIsIm5iZiI6MTczNjQzMzE5NC43NTc2MjMsImV4cCI6MjA1MTk2NTk5NC43NTI5NDYsInN1YiI6IjIxMzcwNjMiLCJzY29wZXMiOlsiYWNlc3Nhcl9hcGlfcGFnYSJdfQ.syZXCuO-19Dieo-vAnP0X6GmQPLpjq8D84TxPgVfc4VKj3J167VKFz4oxfaj3VaUB6YhvFNjAZYJV-KQ-tMESDjBOqP4rijiXcBEcHuJjhX2kh2U-cNAhL-zESXCJ980Lo_rVZxqRONOcTlHer6Up0D7GcYNl_yxT7jl7v7MU-N1Z0_OdkHU_egUoRNwSv-Hsy9dJFiJu8iO-oS7OglZ2pxDSgY1_OtjPA7M8DiiRS-M1xLNb7w5f1iIUdnxFssbqG0caJLhfkfGpF4zLLBOHmkCWB2Z9kqvQ1qQQr0OpQNMWTtiY9Mz5vTSObBCv8Z-qikrM-WiKd0LtEk9Bpa_7Fj0XJGc-bUNa7UPfJv1Ze8rBjWWMZPLqhcIu3M8P-ucE7h4ttyluSjYRPp4meFnwS1Sb8NTvJc2ok6ovvhOdHRUapsc3-XujL9T4dJaRJMhTI75uvoQXJZ_9cPLJ6LRnkMrL952P4lAgmPLYYi89UcqeW0FJp4jNM8u3rmGjPUd9OZA7yEV0Rt9AH6y7R8vyv1of_RrlPh_SlUEhhxvpoiRpygQ2cvfyo-e9MWvOXfnVTeDeLAQzmsm5avttgQwyO1hRUBidsQXRh5VI4ACFPY83bq0k3LkUEepJBG5V7v8FEMTvL0o5maCB2cuklgDKtOb93NJJfvDLmNqZByRiWg';
	public ESCAVADOR_EXTRACTION_MAX_TIME_WINDOW_DAYS: number = 7;
	public ESCAVADOR_ASYNC_UPDATE_MAX_TIME_WINDOW_DAYS: number = 7;
	public ESCAVADOR_CALLBACK_AUTHORIZATION: string = '9gYvyjZ2o1AEMRa5D1moY2D6SHjN5K';

	public BIG_DATA_CORP_API_URL: string = 'https://plataforma.bigdatacorp.com.br';
	public BIG_DATA_CORP_API_ACCESS_TOKEN: string =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRkVSTkFORE8uTUFTSElNT0BVU0VERUxUQUFJLkNPTSIsImp0aSI6IjIwYzVkYmFmLTExMWItNDAyMy04YzVmLTA3MDhhNTE4NzI1ZSIsIm5hbWVVc2VyIjoiRmVybmFuZG8gTWFzaGltbyIsInVuaXF1ZV9uYW1lIjoiRkVSTkFORE8uTUFTSElNT0BVU0VERUxUQUFJLkNPTSIsImRvbWFpbiI6IkRFTFRBIEFJIiwicHJvZHVjdHMiOlsiQklHQk9PU1QiLCJCSUdJRCJdLCJuYmYiOjE3Mzc2NTE0MjAsImV4cCI6MTc2OTE4NzQyMCwiaWF0IjoxNzM3NjUxNDIwLCJpc3MiOiJCaWcgRGF0YSBDb3JwLiJ9.BiM2p3ROsVzPitTvdAByes-Q_dsMFgtOsxcyHzXadGo';
	public BIG_DATA_CORP_API_TOKEN_ID: string = '679274dcff4915d467b9ab55';
	public BIG_DATA_CORP_EXTRACTION_MAX_TIME_WINDOW_DAYS: number = 30;

	public DEPLOY_BI: boolean = true;
	public ENABLE_UPDATE_LAWSUIT_DATA_CRON = true;
}
