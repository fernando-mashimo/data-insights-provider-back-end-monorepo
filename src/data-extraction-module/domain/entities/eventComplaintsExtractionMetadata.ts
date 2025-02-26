export class EventComplaintsExtractionMetadata {
	constructor(
		public cnpj: string,
		public companyName: string,
		public complaintsExtractorExternalId: string,
		public lastUpdatedAt: Date,
		public lastComplaintsListHash?: string,
		public lastComplaintsListPersistedAt?: Date,
	) {}
}
