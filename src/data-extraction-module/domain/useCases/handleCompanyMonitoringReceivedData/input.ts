export type HandleCompanyMonitoringReceivedDataUseCaseInput = {
	monitoredCnpj: string;
	variationCnpj: string;
	externalId: string;
	receivedData: {
		[key: string]: string | number | boolean | object | null;
	};
};
