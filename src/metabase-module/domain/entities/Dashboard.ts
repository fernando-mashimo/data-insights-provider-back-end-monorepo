/**
 * Dashboards map.
 * Don't have all dashboards, only the ones that are used in the application for some
 * specific rule.
 */
export enum Dashboard {
	// used for testing only, this dashboard does not exist
	TEST = 0,
	TEST_PRE_FILTER = -1,

	ATACADAO_MY_LAWSUITS = 21,
	ATACADAO_MY_LAWSUITS_DEMO = 24,
	ATACADAO_MY_LAWSUITS_LIST = 22,
	ATACADAO_MY_LAWSUITS_DETAIL = 30,

	/**
	 * Demo Dashboards
	 */
	DEMO_OPERATIONAL_RISK = 26,
	DEMO_MY_LAWSUITS = 29,

	/**
	 * Navigable dashboards but with no real data.
	 */
	FAKE_GENERAL_RISK = 8,
	FAKE_FINANCIAL_RISK = 7,
	FAKE_OPERATIONAL_RISK = 6,
	FAKE_LAWSUIT_PROBABILITY_RISK = 9,

	/**
	 * These are not real dashboard ids, they are used to show a disclaimer page
	 * like "You don't have access to this dashboard - Buy our product to access it".
	 * But user must have this dashboard in the list of allowedItems to access it.
	 */
	BLOCKED_GENERAL_RISK = -1,
	BLOCKED_FINANCIAL_RISK = -2,
	BLOCKED_LAWSUIT_PROBABILITY_RISK = -4,

	/**
	 * Common Dashboards
	 */
	GENERAL_RISK = 16,
	FINANCIAL_RISK = 14,
	OPERATIONAL_RISK = 18,
	MY_LAWSUITS = 25,
	LAWSUIT_PROBABILITY_RISK = 27
}
