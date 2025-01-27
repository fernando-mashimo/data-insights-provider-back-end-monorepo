export interface CompanyMonitoringQueue {
  sendCreateCompanyMonitoringMessage(input: CompanyMonitoringQueueInput): Promise<void>;
}

export type CompanyMonitoringQueueInput = {
  cnpj: string;
};
