export interface LawsuitsDataUpdateQueue {
  sendUpdateDataMessages(input: LawsuitsDataUpdateQueueInput): Promise<void>;
}

export type LawsuitsDataUpdateQueueInput = {
  lawsuits: GenericLawsuitData[];
};

type GenericLawsuitData = {
	[key: string]: string | number | boolean | object | null;
};
