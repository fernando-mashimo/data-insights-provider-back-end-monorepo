export interface PersonDataExtractorClient {
	getBasicData(cpf: string): Promise<GenericExtractedData>;
  getFinancialData(cpf: string): Promise<GenericExtractedData>;
  getLawsuitsData(cpf: string): Promise<GenericExtractedData>;
}

export type GetDataRequestBody = {
  Datasets: string;
  q: string;
};

export type GenericExtractedData = {
	[key: string]: string | number | boolean | object | null;
};
