export type sqsEventBody = {
	event: string;
	monitoramento: {
		id: number;
		termo: string;
		criado_em: string;
		variacoes: string[];
		termos_auxiliares: string[];
	};
	processo: {
		[key: string]: string | number | boolean | object | null;
	};
	uuid: string;
};
