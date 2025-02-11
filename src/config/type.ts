/**
 * Configuration interface for the application.
 */
export interface Config {
	/**
	 * The environment in which the application is running.
	 */
	ENVIRONMENT: 'production' | 'staging';

	/**
	 * The AWS region where resources are deployed.
	 */
	AWS_REGION: string;

	/**
	 * The AWS account ID.
	 */
	AWS_ACCOUNT_ID: string;

	/**
	 * Timeout for axios requests in seconds.
	 */
	AXIOS_REQUEST_TIMEOUT_SECONDS: number;

	/**
	 * The domain name that you have registered and hosted on Route 53.
	 */
	DOMAIN_NAME: string;

	/**
	 * Old domain names, used just to keep certificates while migrating to the new domain.
	 */
	OTHERS_DOMAIN_NAME: string[];

	/**
	 * Authentication domain name, must be a subdomain of DOMAIN_NAME.
	 */
	AUTH_DOMAIN_NAME: string;

	/**
	 * Application domain name, must be a subdomain of DOMAIN_NAME.
	 */
	APP_DOMAIN_NAME: string;

	/**
	 * Business Intelligence domain name, must be a subdomain of DOMAIN_NAME.
	 */
	BI_DOMAIN_NAME: string;

	/**
	 * API Gateway domain name.
	 */
	API_GATEWAY_DOMAIN_NAME: string;

	/**
	 * No-reply email address.
	 */
	NOREPLY_EMAIL: string;

	/**
	 * Name associated with the no-reply email address.
	 */
	NOREPLY_EMAIL_NAME: string;

	/**
	 * Contact email address.
	 */
	CONTACT_EMAIL: string;

	/**
	 * List of application allowed login URL callbacks. Used for OAuth2.
	 */
	APPLICATION_LOGIN_URL_CALLBACKS: string[];

	/**
	 * List of application allowed logout URL callbacks. Used for OAuth2.
	 */
	APPLICATION_LOGOUT_URL_CALLBACKS: string[];

	/**
	 * List of allowed application origins. Used for CORS.
	 */
	APPLICATION_ORIGINS: string[];

	/**
	 * Business Intelligence API URL.
	 */
	BI_API_URL: string;

	/**
	 * Business Intelligence API key.
	 */
	BI_API_KEY: string;

	/**
	 * Secret used for encoding Business Intelligence embeds.
	 */
	BI_EMBED_ENCODE_SECRET: string;

	/**
	 * Expiration time for Business Intelligence embed URLs in minutes.
	 */
	BI_EMBED_URL_EXPIRATION_IN_MINUTES: number;

	/**
	 * Email address for error notifications.
	 */
	ERROR_NOTIFICATION_EMAIL: string;

	/**
	 * Name of the data extraction events table.
	 */
	DATA_EXTRACTION_EVENTS_TABLE_NAME: string;

	/**
	 * Name of the data extraction bucket.
	 */
	DATA_EXTRACTION_BUCKET_NAME: string;

	/**
	 * URL for Piped API authentication.
	 */
	PIPED_API_AUTH_URL: string;

	/**
	 * Client ID for Piped API.
	 */
	PIPED_API_CLIENT_ID: string;

	/**
	 * Client secret for Piped API.
	 */
	PIPED_API_CLIENT_SECRET: string;

	/**
	 * Base URL for Piped API.
	 */
	PIPED_API_BASE_URL: string;

	/**
	 * URL for BrighData API.
	 */
	BRIGHDATA_API_URL: string;

	/**
	 * API key for BrighData API.
	 */
	BRIGHDATA_API_KEY: string;

	/**
	 * Dataset ID for LinkedIn extraction API.
	 */
	LINKEDIN_EXTRACTION_API_DATASET_ID: string;

	/**
	 * Notification URL for LinkedIn extraction API.
	 */
	LINKEDIN_EXTRACTION_API_NOTIFY_URL: string;

	/**
	 * Authorization token for LinkedIn extraction webhook.
	 */
	LINKEDIN_EXTRACTION_WEBHOOK_AUTHORIZATION: string;

	/**
	 * Maximum time window in days for LinkedIn extraction.
	 * If you request extract the same data in a period less than this value, the workflow will be skipped.
	 */
	LINKEDIN_EXTRACTION_MAX_TIME_WINDOW_DAYS: number;

	/**
	 * URL for Escavador API.
	 */
	ESCAVADOR_API_URL: string;

	/**
	 * API key for Escavador API.
	 */
	ESCAVADOR_API_KEY: string;

	/**
	 * Maximum time window in days for Escavador extraction.
	 * If you request extract the same data in a period less than this value, the workflow will be skipped.
	 */
	ESCAVADOR_EXTRACTION_MAX_TIME_WINDOW_DAYS: number;

	/**
	 * Maximum time window in days for asynchronous updates from Escavador.
	 * If you request extract the same data in a period less than this value, the workflow will be skipped.
	 */
	ESCAVADOR_ASYNC_UPDATE_MAX_TIME_WINDOW_DAYS: number;

	/**
	 * Authorization token for Escavador company monitoring received data webhook.
	 */
	ESCAVADOR_CALLBACK_AUTHORIZATION: string;

	/**
	 * URL for Big Data Corp API.
	 */
	BIG_DATA_CORP_API_URL: string;

	/**
	 * Access token for Big Data Corp API.
	 */
	BIG_DATA_CORP_API_ACCESS_TOKEN: string;

	/**
	 * Token ID for Big Data Corp API.
	 */
	BIG_DATA_CORP_API_TOKEN_ID: string;

	/**
	 * Maximum time window in days for Big Data Corp extraction.
	 * If you request extract the same data in a period less than this value, the workflow will be skipped.
	 */
	BIG_DATA_CORP_EXTRACTION_MAX_TIME_WINDOW_DAYS: number;

	/**
	 * Flag to deploy Business Intelligence, used to disable on staging to reduce costs.
	 */
	DEPLOY_BI: boolean;

	/**
	 * Flag to enable the update lawsuit data cron job. Used to disable on staging to reduce costs, and prevent data extraction of
	 * production data.
	 */
	ENABLE_UPDATE_LAWSUIT_DATA_CRON: boolean;
}
