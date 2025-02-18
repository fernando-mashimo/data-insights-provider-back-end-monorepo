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

	// 3 - 'resultado_processo_async' (EXTRACT_LAWSUIT_DOCUMENT):
	id: number; // id of the async process at Escavador
	tipo: string;
	valor: string; // cnj
	numero_processo: string; // cnj
	status: 'SUCESSO' | 'ERRO';
	resposta: {
		[key: string]: string | number | boolean | object | null;
		instancias: {
			[key: string]: string | number | boolean | object | null;
			documentos_restritos: {
				[key: string]: string | number | boolean | object | null;
				link_api: string;
        hash: string;
			}[];
		}[];
	}; // extracted data (core data)
	enviar_callback: string;
	status_callback: string;
	link_api: string;
	created_at: GenericExtractedData;
};

export enum CallbackEventType {
	NEW_LAWSUITS_FOUND = 'novo_processo',
	LAWSUIT_DATA_UPDATED = 'atualizacao_processo_concluida',
	EXTRACT_LAWSUIT_DOCUMENT = 'resultado_processo_async'
}

type GenericExtractedData = {
	[key: string]: string | number | boolean | object | null;
};
