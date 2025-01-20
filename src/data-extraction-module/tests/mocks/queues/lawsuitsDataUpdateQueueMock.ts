import { LawsuitsDataUpdateQueue } from "../../../domain/queues/lawsuitDataUpdateQueue";

export class LawsuitsDataUpdateQueueMock implements LawsuitsDataUpdateQueue {
  sendUpdateDataMessages(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
