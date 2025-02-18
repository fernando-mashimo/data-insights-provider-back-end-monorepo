export type ExtractLawsuitDocumentUseCaseInput = {
	cnj: string;
	asyncProcessExternalId: string;
	lawsuitData: {
		[key: string]: string | number | boolean | object | null;
	};
	lawsuitDocumentsData: { url: string; fileHash: string }[];
};
