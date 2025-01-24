import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { $config } from '$config';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cw from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as cwActions from 'aws-cdk-lib/aws-cloudwatch-actions';

export class GlobalAlarmsModule extends cdk.Stack {
	public lambdaFunctionsErrorAlarmTopic: sns.Topic;

	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		this.lambdaFunctionsErrorAlarmTopic = this.createCentralSnsForLambdaErrorsFunctions();
		this.setGlobalLambdaFunctionsErrorsAlarm(this.lambdaFunctionsErrorAlarmTopic);
	}

	private createCentralSnsForLambdaErrorsFunctions(): sns.Topic {
		const lambdaFunctionsErrorAlarmTopic = new sns.Topic(
			this,
			'LambdaFunctionsExecutionErrorAlarmTopic',
			{
				topicName: 'LambdaFunctionsExecutionErrorAlarmTopic',
				displayName: 'Lambda Function Execution Error Alarm Topic'
			}
		);

		lambdaFunctionsErrorAlarmTopic.addSubscription(
			new subs.EmailSubscription($config.ERROR_NOTIFICATION_EMAIL)
		);

		return lambdaFunctionsErrorAlarmTopic;
	}

	private setGlobalLambdaFunctionsErrorsAlarm(topic: sns.Topic): void {
		const lambdaFunctionsErrorAlarm = new cw.Alarm(this, 'LambdaFunctionsExecutionErrorAlarm', {
			metric: lambdaNodejs.NodejsFunction.metricAllErrors(),
			evaluationPeriods: 1,
			threshold: 1,
			comparisonOperator: cw.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
			alarmName: 'LambdaFunctionsExecutionErrorAlarm',
			actionsEnabled: true
		});
		lambdaFunctionsErrorAlarm.addAlarmAction(new cwActions.SnsAction(topic));
	}
}
