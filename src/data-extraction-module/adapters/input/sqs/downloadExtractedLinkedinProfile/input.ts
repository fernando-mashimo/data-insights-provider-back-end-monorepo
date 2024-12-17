export type sqsEventBody = {
	snapshot_id: string;
	status: string;
	error?: string;
};
