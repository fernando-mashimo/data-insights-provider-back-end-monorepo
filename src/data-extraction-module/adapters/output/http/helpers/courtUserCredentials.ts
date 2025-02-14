export const getCourtUserCredentials = (
	cnj: string,
	state: string
): { userName: string; password: string } => {
	switch (state) {
		case 'AC':
			return {
				userName: '418.055.098-96',
				password: '30116093'
			};

		case 'AL':
			return {
				userName: '418.055.098-96',
				password: '9HpHch7b!CF8C'
			};
		case 'AP':
			return {
				userName: '397209sp',
				password: '(@)Aurora2024'
			};
		case 'BA':
			if (cnj.startsWith('0')) {
				return {
					userName: '397209SP',
					password: '(@)Aurora2024'
				};
			}
			return {
				userName: '41805509896',
				password: '(@)Aurora2024'
			};
		case 'MS':
			return {
				userName: '418.055.098-96',
				password: '(@)Aurora2024'
			};
		case 'PR':
			return {
				userName: '41805509896',
				password: '301160'
			};
		case 'RR':
			return {
				userName: 'sp397209',
				password: '(@)Aurora2024'
			};
		case 'SP':
			return {
				userName: '41805509896',
				password: '/condeli301160'
			};
		case 'SE':
			return {
				userName: '397209',
				password: 'DG3UM'
			};
		case 'TO':
			return {
				userName: 'SP397209',
				password: '(@)Aurora2024'
			};
		default:
			return {
				userName: '41805509896',
				password: '(@)Aurora2024'
			};
	}
};
