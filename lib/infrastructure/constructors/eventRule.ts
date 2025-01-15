import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events';

export class EventRuleBasic extends Construct {
	readonly eventRule: events.Rule;

	constructor(scope: Construct, id: string, props: events.RuleProps = {}) {
		super(scope, id);

		this.eventRule = new events.Rule(this, `EventRule`, {
			enabled: true,
      schedule: events.Schedule.cron({ minute: '0', hour: '3' }), // default to 3am UTC
			...props
		});
	}
}
