import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events';

/**
 * Represents a basic event rule construct.
 *
 * This construct creates an AWS EventBridge rule with default schedule of 3 AM UTC.
 * Additional properties can be provided via the `props` parameter.

 */
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
