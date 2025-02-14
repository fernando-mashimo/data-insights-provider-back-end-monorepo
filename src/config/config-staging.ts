import { ConfigProd } from './config-prod';
import { Config } from './type';

export class ConfigStaging implements Config {
	private configProd = new ConfigProd();

	public ENVIRONMENT: 'production' | 'staging' = 'staging';
	public AWS_REGION: string = 'us-east-1';
	public AWS_ACCOUNT_ID: string = '253490753929';

	public AXIOS_REQUEST_TIMEOUT_SECONDS: number = 900;

	public DOMAIN_NAME: string = 'staging.usedeltaai.com'; // This is the domain name that you have registered and hosted on Route 53,
	public OTHERS_DOMAIN_NAME: string[] = [];

	public AUTH_DOMAIN_NAME: string = `auth.${this.DOMAIN_NAME}`; // Must be a subdomain of DOMAIN_NAME
	public APP_DOMAIN_NAME: string = `app.${this.DOMAIN_NAME}`; // Must be a subdomain of DOMAIN_NAME
	public BI_DOMAIN_NAME: string = `bi.${this.DOMAIN_NAME}`; // Must be a subdomain of DOMAIN_NAME
	public API_GATEWAY_DOMAIN_NAME: string = `api.${this.DOMAIN_NAME}`;

	public NOREPLY_EMAIL: string = `no-reply+staging@${this.DOMAIN_NAME}`;
	public NOREPLY_EMAIL_NAME: string = 'Delta AI Staging';
	public CONTACT_EMAIL: string = `contato+staging@${this.configProd.CONTACT_EMAIL}`;

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

	public BI_API_URL: string = this.configProd.BI_API_URL;
	public BI_API_KEY: string = this.configProd.BI_API_KEY;
	public BI_EMBED_ENCODE_SECRET: string = this.configProd.BI_EMBED_ENCODE_SECRET;
	public BI_EMBED_URL_EXPIRATION_IN_MINUTES: number =
		this.configProd.BI_EMBED_URL_EXPIRATION_IN_MINUTES;

	public ERROR_NOTIFICATION_EMAIL: string = `tecnologia+staging@${this.configProd.DOMAIN_NAME}`;

	public DATA_EXTRACTION_EVENTS_TABLE_NAME: string = 'extraction_events';
	public DATA_EXTRACTION_BUCKET_NAME: string = 'delta-ai-extraction-data-staging';

	public PIPED_API_AUTH_URL: string = this.configProd.PIPED_API_AUTH_URL;
	public PIPED_API_CLIENT_ID: string = this.configProd.PIPED_API_CLIENT_ID;
	public PIPED_API_CLIENT_SECRET: string = this.configProd.PIPED_API_CLIENT_SECRET;
	public PIPED_API_BASE_URL: string = this.configProd.PIPED_API_BASE_URL;

	public BRIGHDATA_API_URL: string = this.configProd.BRIGHDATA_API_URL;
	public BRIGHDATA_API_KEY: string = this.configProd.BRIGHDATA_API_KEY;
	public LINKEDIN_EXTRACTION_API_DATASET_ID: string =
		this.configProd.LINKEDIN_EXTRACTION_API_DATASET_ID;
	public LINKEDIN_EXTRACTION_API_NOTIFY_URL: string =
		this.configProd.LINKEDIN_EXTRACTION_API_NOTIFY_URL;
	public LINKEDIN_EXTRACTION_WEBHOOK_AUTHORIZATION: string =
		this.configProd.LINKEDIN_EXTRACTION_WEBHOOK_AUTHORIZATION;
	public LINKEDIN_EXTRACTION_MAX_TIME_WINDOW_DAYS: number =
		this.configProd.LINKEDIN_EXTRACTION_MAX_TIME_WINDOW_DAYS;

	public ESCAVADOR_API_URL: string = this.configProd.ESCAVADOR_API_URL;
	public ESCAVADOR_API_KEY: string = this.configProd.ESCAVADOR_API_KEY;
	public ESCAVADOR_EXTRACTION_MAX_TIME_WINDOW_DAYS: number =
		this.configProd.ESCAVADOR_EXTRACTION_MAX_TIME_WINDOW_DAYS;
	public ESCAVADOR_DOCUMENT_EXTRACTION_MAX_TIME_WINDOW_DAYS: number =
		this.configProd.ESCAVADOR_DOCUMENT_EXTRACTION_MAX_TIME_WINDOW_DAYS;
	public ESCAVADOR_ASYNC_UPDATE_MAX_TIME_WINDOW_DAYS: number =
		this.configProd.ESCAVADOR_ASYNC_UPDATE_MAX_TIME_WINDOW_DAYS;
	public ESCAVADOR_CALLBACK_AUTHORIZATION: string =
		this.configProd.ESCAVADOR_CALLBACK_AUTHORIZATION;

	public BIG_DATA_CORP_API_URL: string = this.configProd.BIG_DATA_CORP_API_URL;
	public BIG_DATA_CORP_API_ACCESS_TOKEN: string = this.configProd.BIG_DATA_CORP_API_ACCESS_TOKEN;
	public BIG_DATA_CORP_API_TOKEN_ID: string = this.configProd.BIG_DATA_CORP_API_TOKEN_ID;
	public BIG_DATA_CORP_EXTRACTION_MAX_TIME_WINDOW_DAYS: number =
		this.configProd.BIG_DATA_CORP_EXTRACTION_MAX_TIME_WINDOW_DAYS;

	public DEPLOY_BI: boolean = false; // used to disable on staging to reduce costs
	public ENABLE_UPDATE_LAWSUIT_DATA_CRON = false;

	public IS_PRODUCTION_ENV: boolean = false;
}
