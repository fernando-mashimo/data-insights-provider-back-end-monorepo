import { $config } from '$config';
import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as fs from 'fs';
import * as path from 'path';

export interface AuthzStackProps extends cdk.StackProps {}

export class AuthzStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: AuthzStackProps) {
		super(scope, id, props);

		const userPool = this.createUserPool();
		this.addCustomDomain(userPool);
		this.addAppClient(userPool);
		this.customizeAuthUI(userPool);
	}

	private createUserPool(): cognito.IUserPool {
		return new cognito.UserPool(this, 'UserPool', {
			userPoolName: 'DefaultUserPool',
			selfSignUpEnabled: false,
			signInAliases: { email: true },
			autoVerify: { email: true },
			standardAttributes: {
				email: {
					required: true,
					mutable: true
				}
			},
			passwordPolicy: {
				minLength: 8,
				requireLowercase: true,
				requireUppercase: true,
				requireDigits: true,
				requireSymbols: true
			},
			accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
			email: cognito.UserPoolEmail.withSES({
				fromEmail: $config.NOREPLY_EMAIL,
				fromName: $config.NOREPLY_EMAIL_NAME,
				replyTo: $config.CONTACT_EMAIL,
				sesVerifiedDomain: $config.DOMAIN_NAME
			})
		});
	}

	private addCustomDomain(userPool: cognito.IUserPool) {
		const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
			domainName: $config.DOMAIN_NAME
		});

		const certificate = new acm.Certificate(this, 'AuthDomainCertificate', {
			domainName: $config.AUTH_DOMAIN_NAME,
			validation: acm.CertificateValidation.fromDns(hostedZone)
		});

		new cdk.CfnOutput(this, 'CertificateArn', {
			value: certificate.certificateArn
		});

		const userPoolDomain = userPool.addDomain('CognitoDomain', {
			customDomain: {
				domainName: $config.AUTH_DOMAIN_NAME,
				certificate: certificate
			}
		});

		// Point the domain to the user pool
		new route53.ARecord(this, 'AliasRecord', {
			zone: hostedZone,
			recordName: $config.AUTH_DOMAIN_NAME + '.',
			target: route53.RecordTarget.fromAlias(new targets.UserPoolDomainTarget(userPoolDomain))
		});
	}

	private addAppClient(userPool: cognito.IUserPool) {
		// Create a User Pool Client
		const userPoolAppClient = new cognito.UserPoolClient(this, 'CognitoAppClient', {
			userPool,
			generateSecret: false,
			idTokenValidity: cdk.Duration.minutes(5),
			accessTokenValidity: cdk.Duration.minutes(5),
			refreshTokenValidity: cdk.Duration.days(10),
			oAuth: {
				callbackUrls: $config.APPLICATION_LOGIN_URL_CALLBACKS,
				logoutUrls: $config.APPLICATION_LOGOUT_URL_CALLBACKS,
				flows: {
					authorizationCodeGrant: true
				},
				scopes: [cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE, cognito.OAuthScope.OPENID]
			},
			supportedIdentityProviders: [cognito.UserPoolClientIdentityProvider.COGNITO]
		});

		// Output the User Pool ID and Client ID
		new cdk.CfnOutput(this, 'UserPoolId', {
			value: userPool.userPoolId
		});

		new cdk.CfnOutput(this, 'CognitoAppClientId', {
			value: userPoolAppClient.userPoolClientId
		});
	}

	private customizeAuthUI(pool: cognito.IUserPool) {
		// https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-ui-customization.html

		const imageData = fs.readFileSync(path.join(__dirname, 'assets/logo.png')).toString('base64');
		const cssData = fs
			.readFileSync(path.join(__dirname, 'assets/custom.css'))
			.toString('utf8')
			.replace('$IMAGE_DATA', imageData);

		new cognito.CfnUserPoolUICustomizationAttachment(this, 'UserPoolHostedUILogo', {
			clientId: 'ALL',
			userPoolId: pool.userPoolId,
			css: cssData
		});
	}
}
