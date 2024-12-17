export type BaseDdbTableType = {
	// we are using gsi overloading technique, so you must define all the attributes here, even if they are not used in your specific entity

	pk: string;
	sk: string;

	gsi1pk: string;
	gsi1sk: string;
};

export const EMPTY_DDB_ATTRIBUTE = '-';
