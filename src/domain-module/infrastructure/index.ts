import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as ses from 'aws-cdk-lib/aws-ses';
import { $config } from '$config';

export class DomainStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const domainsName = [$config.DOMAIN_NAME, ...$config.OTHERS_DOMAIN_NAME];

		domainsName.forEach((domainName) => {
			this.addSesIdentity(domainName);
		});
	}

	private addSesIdentity(domainName: string) {
		// Lookup the hosted zone
		const hostedZone = route53.HostedZone.fromLookup(this, `${domainName}HostedZone`, {
			domainName: domainName
		});

		// Create SES domain identity
		const sesDomainIdentity = new ses.EmailIdentity(this, `${domainName}SesDomainIdentity`, {
			identity: ses.Identity.domain(domainName),
			dkimSigning: true
		});

		// Create DKIM records
		sesDomainIdentity.dkimRecords.forEach((dkimRecord, index) => {
			// Temporary workaround: There is a bug with the EmailIdentity construct where if the DKIM record is x.y.example.com,
			// and the hosted zone is y.example.com, the record that gets set is x.y.example.com.y.example.com. For now, we are
			// manually creating the correct records.
			// https://github.com/aws/aws-cdk/issues/21306
			new route53.CfnRecordSet(this, `${domainName}DkimRecord${index + 1}`, {
				hostedZoneName: hostedZone.zoneName + '.',
				name: dkimRecord.name,
				type: 'CNAME',
				resourceRecords: [dkimRecord.value],
				ttl: '1800'
			});
		});
	}
}
