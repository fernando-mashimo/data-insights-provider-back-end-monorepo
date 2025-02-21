export class TokenNotFound extends Error {
  constructor(entity: string) {
    super(`Token not found for entity ${entity}`);
  }
}
