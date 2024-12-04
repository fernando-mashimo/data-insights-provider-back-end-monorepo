import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { $config } from '$config';
import * as dlm from 'aws-cdk-lib/aws-dlm';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventsTargets from 'aws-cdk-lib/aws-events-targets';

/**
 * This stack creates a Metabase instance with a persistent EBS volume for DB data store.
 * For the first execution you need to change the create Ec2Instance to on init format the volume.
 * After the first execution, you can comment the formatExternalVolume.
 *
 * NOTE: The volume attachment is not automatic, you need to manually attach the volume to the instance.
 * Wait the volume and instance be created, go to the EBS volume console, and attach/detach the volume to the instance.
 * After that, the instance will mount the volume and start the docker-compose automatically.
 *
 * NOTE: The attachment device must be /dev/sdf
 *
 * NOTE: This stack only run on us-east-1 region, with some hard coded values:
 *  - VPC ID
 *  - Public Subnet
 *  - Prefix List for CloudFront and Connect Console
 *  - Data Lifecycle Manager Role Arn
 */
export class MetabaseStack extends cdk.Stack {
	public readonly ssoHandler: lambdaNodejs.NodejsFunction;
	public readonly updateDashboardCardsHandler: lambdaNodejs.NodejsFunction;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const vpc = this.createVpc();
		const securityGroup = this.createSecurityGroup(vpc);
		this.createPersistentEBSVolumeToDb();
		const ec2Instance = this.createEc2Instance(vpc, securityGroup);
		this.createCloudFrontForMetabase(ec2Instance);
		this.ssoHandler = this.createSsoHandler();
		this.updateDashboardCardsHandler = this.createUpdateDashboardCardsHandler();
    this.scheduleUpdateDashboardCards();

		/**
		 * TODO - when cloudfront vpc origin become available through cdk
		 * change this instance to private subnet
		 * and create a cloudfront distribution with vpc origin
		 */
	}

	/**
	 * using databricks vpc to reduce the cost (this vpc already have a NAT)
	 */
	private createVpc(): ec2.IVpc {
		const vpc = ec2.Vpc.fromLookup(this, 'VPC', {
			vpcId: 'vpc-036f9e50c6c68af7d'
		});

		return vpc;
	}

	private createSecurityGroup(vpc: ec2.IVpc): ec2.ISecurityGroup {
		const securityGroup = new ec2.SecurityGroup(this, 'MetabaseSecurityGroup', {
			vpc,
			description: 'Allow http from cloudfront and ssh from connect console',
			allowAllOutbound: true
		});

		// allow http from cloudfront
		securityGroup.addIngressRule(ec2.Peer.prefixList('pl-3b927c52'), ec2.Port.tcp(80));

		// allow ssh from connect console
		securityGroup.addIngressRule(ec2.Peer.prefixList('pl-09f90e410b133fe9f'), ec2.Port.tcp(22));
		securityGroup.addIngressRule(ec2.Peer.prefixList('pl-0e4bcff02b13bef1e'), ec2.Port.tcp(22));

		return securityGroup;
	}

	/**
	 * creates or retrieves an EBS volume that persists data and have daily snapshot
	 * @returns
	 */
	private createPersistentEBSVolumeToDb(): ec2.IVolume {
		const volumeName = 'MetabaseEBSVolume';
		const volume = new ec2.Volume(this, 'MetabaseEBSVolume', {
			availabilityZone: 'us-east-1a',
			size: cdk.Size.gibibytes(20),
			volumeType: ec2.EbsDeviceVolumeType.GP3,
			removalPolicy: cdk.RemovalPolicy.RETAIN,
			volumeName
		});

		// create a snapshot every day with 7 days retention
		new dlm.CfnLifecyclePolicy(this, 'MetabaseEBSVolumeSnapshotPolicy', {
			description: 'Metabase EBS Volume Snapshot Policy',
			policyDetails: {
				resourceTypes: ['VOLUME'],
				schedules: [
					{
						name: 'DailySnapshot',
						createRule: {
							interval: 24,
							intervalUnit: 'HOURS',
							times: ['00:00']
						},
						retainRule: {
							count: 7
						}
					}
				],
				targetTags: [
					{
						key: 'Name',
						value: volumeName
					}
				]
			},
			state: 'ENABLED',
			executionRoleArn:
				'arn:aws:iam::225989342294:role/service-role/AWSDataLifecycleManagerDefaultRole'
		});

		return volume;
	}

	/**
	 * Create an EC2 instance with docker, and docker compose.
	 * Metabase recommend:
	 *  - 1 CPU and 1GB of RAM for metabase instance for each 20 users
	 *  - 1 CPU and 2GB of RAM for database instance for each 40 users
	 *
	 * We choose one single instance for both Metabase and Database (t4g.medium)
	 * without any autoscaling group, and multi node
	 */
	private createEc2Instance(vpc: ec2.IVpc, securityGroup: ec2.ISecurityGroup): ec2.IInstance {
		const wDir = '/opt/docker_data';
		const sDir = __dirname;

		const instance = new ec2.Instance(this, 'MetabaseInstance', {
			instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3A, ec2.InstanceSize.MEDIUM),
			machineImage: new ec2.AmazonLinuxImage({
				generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
				cpuType: ec2.AmazonLinuxCpuType.X86_64 // NOTE metabase does not support ARM
			}),
			vpc,
			associatePublicIpAddress: true,
			vpcSubnets: {
				subnetType: ec2.SubnetType.PUBLIC
			},
			securityGroup,
			init: ec2.CloudFormationInit.fromConfigSets({
				configSets: {
					default: [
						'installDocker', // install docker
						'installDockerCompose', // install docker-compose
						// 'formatExternalVolume', // await esb be attached and format it, be careful with this step as it will erase all db data
						'mountExternalVolume', // await esb be attached and mount it
						'startApplication' // start the docker compose
					]
				},
				configs: {
					installDocker: new ec2.InitConfig([
						ec2.InitPackage.yum('docker'),
						ec2.InitService.enable('docker'),
						ec2.InitCommand.shellCommand('usermod -a -G docker ec2-user')
					]),
					installDockerCompose: new ec2.InitConfig([
						ec2.InitCommand.shellCommand(
							'sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose'
						),
						ec2.InitCommand.shellCommand('sudo chmod +x /usr/local/bin/docker-compose')
					]),
					formatExternalVolume: new ec2.InitConfig([
						ec2.InitCommand.shellCommand('while [ ! -e /dev/sdf ]; do sleep 1; done'),
						ec2.InitCommand.shellCommand('sudo mkfs -t ext4 /dev/sdf')
					]),
					mountExternalVolume: new ec2.InitConfig([
						ec2.InitCommand.shellCommand('while [ ! -e /dev/sdf ]; do sleep 1; done'),
						ec2.InitCommand.shellCommand('sudo mkdir -p /mnt/data'),
						ec2.InitCommand.shellCommand('sudo mount /dev/sdf /mnt/data'),
						ec2.InitCommand.shellCommand('sudo mkdir -p /mnt/data/metabase-db-data'),
						ec2.InitCommand.shellCommand(
							'echo "/dev/sdf /mnt/data ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab'
						)
					]),
					startApplication: new ec2.InitConfig([
						ec2.InitFile.fromFileInline(`${wDir}/docker-compose.yml`, `${sDir}/docker-compose.yml`),
						ec2.InitCommand.shellCommand('docker-compose up -d', {
							env: {
								DATABASE_LOCAL_PATH: '/mnt/data/metabase-db-data'
							},
							cwd: wDir
						})
					])
				}
			}),
			userDataCausesReplacement: true,
			initOptions: {
				configSets: ['default'],
				timeout: cdk.Duration.minutes(10),
				ignoreFailures: false,
				printLog: true
			}
		});

		return instance;
	}

	private createCloudFrontForMetabase(ec2Instance: ec2.IInstance): void {
		const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
			domainName: $config.DOMAIN_NAME
		});

		const certificate = new acm.Certificate(this, 'AuthDomainCertificate', {
			domainName: $config.BI_DOMAIN_NAME,
			validation: acm.CertificateValidation.fromDns(hostedZone)
		});

		const distribution = new cloudfront.Distribution(this, 'MetabaseDistribution', {
			domainNames: [$config.BI_DOMAIN_NAME],
			certificate,
			enabled: true,
			defaultBehavior: {
				origin: new origins.HttpOrigin(ec2Instance.instancePublicDnsName, {
					protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY
				}),
				viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
				originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
				allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
				cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
				compress: true
			},
			defaultRootObject: ''
		});

		new route53.ARecord(this, 'AliasRecord', {
			zone: hostedZone,
			target: route53.RecordTarget.fromAlias(new route53Targets.CloudFrontTarget(distribution)),
			recordName: $config.BI_DOMAIN_NAME
		});
	}

	private createSsoHandler(): lambdaNodejs.NodejsFunction {
		return new lambdaNodejs.NodejsFunction(this, 'GetEmbedUrlFunction', {
			functionName: 'GetEmbedUrlFunction',
			description: 'Lambda function to handle Get Embed Url in Delta AI',
			entry: 'src/metabase-module/adapters/input/http-api-gateway/getEmbedUrl/index.ts',
			handler: 'handler',
			runtime: lambda.Runtime.NODEJS_20_X,
			memorySize: 128, // might require 512MB
			timeout: cdk.Duration.seconds(10),
			bundling: {
				minify: true,
				sourceMap: true
			},
			environment: {} // might require environment variables
		});
	}

	private createUpdateDashboardCardsHandler(): lambdaNodejs.NodejsFunction {
		return new lambdaNodejs.NodejsFunction(this, 'UpdateDashboardCardsFunction', {
			functionName: 'UpdateDashboardCardsFunction',
			description: 'Lambda function to handle Update Dashboard Cards in Delta AI',
			entry: 'src/metabase-module/adapters/input/http-api-gateway/updateDashboardCards/index.ts',
			handler: 'handler',
			runtime: lambda.Runtime.NODEJS_20_X,
			memorySize: 512,
			timeout: cdk.Duration.seconds(30),
			bundling: {
				minify: true,
				sourceMap: true
			},
			environment: {}
		});
	}

	private scheduleUpdateDashboardCards(): void {
		const rule = new events.Rule(this, 'UpdateDashboardCardsScheduleRule', {
			schedule: events.Schedule.cron({ minute: '0', hour: '3' })
		});
		rule.addTarget(new eventsTargets.LambdaFunction(this.updateDashboardCardsHandler));
	}
}
