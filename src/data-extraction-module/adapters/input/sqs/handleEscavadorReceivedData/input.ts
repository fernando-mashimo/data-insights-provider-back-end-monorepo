export type sqsEventBody = {
	// request body sent by Escavador callback
	event: CallbackEventType;
	uuid: string;

	// The following fields are specific to the event type
	// 1 - 'novo_processo' (NEW_LAWSUIT):
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

	// 2 - 'atualizacao_processo_concluida' (UPDATE_LAWSUIT):
	atualizacao: {
		id: number;
		status: string;
		criado_em: string;
		numero_cnj: string;
		concluido_em: string;
		enviar_callback: string;
	};
};

export enum CallbackEventType {
	NEW_LAWSUITS_FOUND = 'novo_processo',
	LAWSUIT_DATA_UPDATED = 'atualizacao_processo_concluida'
}
