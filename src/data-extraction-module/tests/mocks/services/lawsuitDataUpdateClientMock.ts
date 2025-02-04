import {
	LawsuitDataUpdateClient,
	LawsuitSubscription,
	UnsyncedLawsuitSubscription,
	UpdatedLawsuitData
} from '../../../domain/services/lawsuitDataUpdateClient';

export class LawsuitDataUpdateClientMock implements LawsuitDataUpdateClient {
	getLawsuitSubscriptionById(): Promise<LawsuitSubscription> {
		throw new Error('Method not implemented.');
	}
	createLawsuitSubscription(): Promise<LawsuitSubscription> {
		throw new Error('Method not implemented.');
	}
	getUpdatedLawsuitData(): Promise<UpdatedLawsuitData> {
		throw new Error('Method not implemented.');
	}
	getUnsyncedLawsuitsSubscriptions(): Promise<UnsyncedLawsuitSubscription[]> {
		throw new Error('Method not implemented.');
	}
}
