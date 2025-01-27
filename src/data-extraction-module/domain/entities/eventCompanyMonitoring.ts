export class EventCompanyMonitoring {
  public id: string;

  constructor(
    public monitoredCnpj: string,
    public variationCnpj: string,
    public externalId: string,
    public createdAt: Date,
  ) {
    this.id = `${monitoredCnpj}#ExtId_${externalId}`;
  }
}
