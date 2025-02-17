export const getCourtCredentialsByCnj = (cnj: string): { userName: string; password: string } => {
	const cleanCnj = cnj.replace(/\D/g, '');

	const courtIdentificationString = cleanCnj.substring(13, 16);
	const lawsuitCourt =
		courtIdentificationString === '805' && cnj.charAt(0) === '0'
			? '0-805'
			: courtIdentificationString;

	return getCredentialsByLawsuitCourt(lawsuitCourt);
};

const getCredentialsByLawsuitCourt = (
	courtIdentificationString: string
): { userName: string; password: string } => {
	const courtAndCredendtialsMapping: Record<
		string,
		{ state: string; credentials: { userName: string; password: string } }
	> = {
		// Justiça Estadual (TJ-UF)
		'801': { state: 'AC', credentials: { userName: '418.055.098-96', password: '30116093' } },
		'802': { state: 'AL', credentials: { userName: '418.055.098-96', password: '9HpHch7b!CF8C' } },
		'803': { state: 'AP', credentials: { userName: '397209sp', password: '(@)Aurora2024' } },
		'804': { state: 'AM', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'805': { state: 'BA', credentials: { userName: '41805509896', password: '(@)Aurora2024' } }, // cnj starts with '8'
		'0-805': { state: 'BA', credentials: { userName: '397209SP', password: '(@)Aurora2024' } }, // cnj starts with '0'
		'806': { state: 'CE', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'807': { state: 'DF', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'808': { state: 'ES', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'809': { state: 'GO', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'810': { state: 'MA', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'811': { state: 'MT', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'812': { state: 'MS', credentials: { userName: '418.055.098-96', password: '(@)Aurora2024' } },
		'813': { state: 'MG', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'814': { state: 'PA', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'815': { state: 'PB', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'816': { state: 'PR', credentials: { userName: '41805509896', password: '301160' } },
		'817': { state: 'PE', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'818': { state: 'PI', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'819': { state: 'RJ', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'820': { state: 'RN', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'821': { state: 'RS', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'822': { state: 'RO', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'823': { state: 'RR', credentials: { userName: 'sp397209', password: '(@)Aurora2024' } },
		'824': { state: 'SC', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'825': { state: 'SE', credentials: { userName: '397209', password: 'DG3UM' } },
		'826': { state: 'SP', credentials: { userName: '41805509896', password: '/condeli301160' } },
		'827': { state: 'TO', credentials: { userName: 'SP397209', password: '(@)Aurora2024' } },
		// Justiça Federal (TRF)
		'401': { state: 'BA', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'402': { state: 'ES', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		// Justiça do Trabalho (TRT)
		'501': { state: 'RJ', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'502': { state: 'SP', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'503': { state: 'MG', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'504': { state: 'RS', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'505': { state: 'BA', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'506': { state: 'PE', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'507': { state: 'CE', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'508': { state: 'AP/PQ', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'509': { state: 'PR', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'510': { state: 'DF/TO', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'511': { state: 'AM/RR', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'512': { state: 'SC', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'513': { state: 'PB', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'514': { state: 'RO/AC', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'515': {
			state: 'SP (interior)',
			credentials: { userName: '41805509896', password: '(@)Aurora2024' }
		},
		'516': { state: 'MA', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'517': { state: 'ES', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'518': { state: 'GO', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'519': { state: 'AL', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'520': { state: 'SE', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'521': { state: 'RN', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'522': { state: 'PI', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'523': { state: 'MT', credentials: { userName: '41805509896', password: '(@)Aurora2024' } },
		'524': { state: 'MS', credentials: { userName: '41805509896', password: '(@)Aurora2024' } }
	};

	return courtAndCredendtialsMapping[courtIdentificationString].credentials;
};

const credentials = getCourtCredentialsByCnj('00037166920238050113');
console.log(credentials);
