export interface ComplaintsDataExtractorClient {
	getAccessToken(refreshToken: string): Promise<string>;
	getCompanyMetadata(accessToken: string): Promise<CompanyMetadata>;
	getComplaints(
		companyExternalId: string,
		accessToken: string,
		nextPageUrl?: string
	): Promise<ComplaintBasicData[]>;
	getComplaintData(complaintExternalId: string, accessToken: string): Promise<ComplaintFullData>;
}

export type TokenResponse = {
	access_token: string;
	expires_in: number;
	refresh_expires_in: number;
	refresh_token: string;
	token_type: string;
	id_token: string;
	'not-before-policy': number;
	session_state: string;
	scope: string;
};

export type CompanyMetadata = {
	cnpj: string;
	companyName: string;
	companyExternalId: string;
};

export type CompanyBasicMetadata = {
	sub: string;
	companies: string[]; // companies[0] is the companyExternalId
	name: string; // companyName
	fingerprint: string;
	preferred_username: string;
	migrated: boolean;
	given_name: string;
	userId: string;
	family_name: string;
	email: string;
};

export type CompanyAdditionalMetadata = {
	documents: CompanyDocument[];
	[key: string]: string | number | boolean | object | null;
};

type CompanyDocument = {
	number: string;
	type: string;
};

export type ComplaintBasicData = {
	daysRemaining: number | string | null;
	userCity: string | null;
	dateExpire: string | null;
	marketplaceComplain: string | null;
	created: string;
	solved: boolean;
	canBeEvaluated: boolean;
	dealAgain: boolean;
	title: string;
	userName: string;
	requestEvaluation: string | null;
	inModeration: boolean;
	interactions: {
		[key: string]: string | number | boolean | object | null;
	}[];
	complainOrigin: string;
	hasExpired: boolean | null;
	requestEvaluateSent: boolean;
	score: number;
	userState: string;
	legacyId: number;
	evaluated: boolean;
	id: string; // complaintId
	status: string;
};

export type GetComplaintsResponse = {
	prev: string | null;
	next: string | null;
	data: ComplaintBasicData[];
	count: number;
	maxScore: number | null;
	aggregations: {
		[key: string]: string | number | boolean | object | null;
	} | null;
	extraData: {
		[key: string]: string | number | boolean | object | null;
	} | null;
};

export type ComplaintFullData = {
	id: string;
	created: string;
	title: string;
	description: string;
	interactions: InteractionsAttributes[];
	user: {
		id: string;
    status: string;
	};
	solved: boolean;
	dealAgain: boolean;
	evaluation: string;
	score: number;
	evaluated: boolean;
	hasExpired: boolean;
	status: string;
	phones: {
		[key: string]: string | number | boolean | object | null;
	}[];
	userName: string;
	userEmail: string;
	userState: string;
	userCity: string;
	complainOrigin: string;
	hasReply: boolean;
	compliment: boolean;
	company: {
		id: string;
	};
};

export type InteractionsAttributes = {
	created: string;
	id: string;
	message: string;
	type: string;
};
