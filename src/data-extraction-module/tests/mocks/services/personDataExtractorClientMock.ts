import { GenericExtractedData, PersonDataExtractorClient } from "../../../domain/services/personDataExtractorClient";

export class PersonDataExtractorClientMock implements PersonDataExtractorClient {
  getBasicData(): Promise<GenericExtractedData> {
    throw new Error("Method not implemented.");
  }
  getFinancialData(): Promise<GenericExtractedData> {
    throw new Error("Method not implemented.");
  }
  getLawsuitsData(): Promise<GenericExtractedData> {
    throw new Error("Method not implemented.");
  }
}
