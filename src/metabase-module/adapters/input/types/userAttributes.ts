export interface UserAttributes {
	at_hash?: string;
	sub?: string;
	email_verified?: boolean;
	iss?: string;
	'cognito:username'?: string;
	origin_jti?: string;
	aud?: string;
	token_use?: string;
	auth_time?: number;
	exp?: number;
	iat?: number;
	jti?: string;
	email?: string;
	'custom:dashboard_id': number;
}
