export class EventCompanyMonitoringReceivedData {
	public id: string;

	constructor(
		public monitoredCnpj: string,
		public variationCnpj: string,
		public externalId: string,
		public receivedAt: Date
	) {
		this.id = `${monitoredCnpj}_${receivedAt.toISOString()}`;
	}
}
