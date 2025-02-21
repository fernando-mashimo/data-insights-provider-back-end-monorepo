export class ComplaintsDataExtractorToken {
  constructor(
    public cnpj: string,
    public refreshToken: string,
    public accessToken: string,
    public updatedAt: Date
  ) {}
}
