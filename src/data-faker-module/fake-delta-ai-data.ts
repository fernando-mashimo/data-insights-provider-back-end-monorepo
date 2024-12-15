import { faker } from '@faker-js/faker';
import { writeFile } from 'fs';

export class FakeDeltaAiData {
	constructor(amountOfCustomers: number = 30) {
		const customers = this.createCustomers(amountOfCustomers);
		const conversations = this.createConversations(customers);
		const customersRisks = customers.flatMap((customer) => {
			const customerConversations = conversations.filter(
				(conversation) => conversation.customerInternalId === customer.internalId
			);
			return this.createCustomerRisk(customer.internalId, customerConversations);
		});
		const lawsuits = this.createLawsuits(customers);

		const data = {
			customers,
			customersRisks,
			lawsuits,
			conversations
		};

		writeFile(
			'src/data-faker-module/output/delta-ai-fake-data.json',
			JSON.stringify(data),
			(err) => {
				if (err) {
					console.error(err);
					return;
				}
				console.info('File has been created');
			}
		);
	}

	private createCustomers(amountOfCustomers: number): Customer[] {
		const customers: Customer[] = [];
		for (let i = 0; i < amountOfCustomers; i++) {
			customers.push({
				internalId: faker.string.uuid(),
				name: faker.person.fullName(),
				litigantExperience: faker.helpers.arrayElement(Object.values(LitigantExperience))
			});
		}
		return customers;
	}

	private createCustomerRisk(
		customerInternalId: string,
		customerConversations: Conversation[]
	): CustomerRisk[] {
		const customerRisk: CustomerRisk[] = [];

		for (const conversation of customerConversations) {
			if (conversation.sentiment === Sentiment.Satisfaction) continue;

			const insatisfactionLevel = conversation.sentimentGrade;
			const lawsuitProbability = faker.number.int({ min: 30, max: 100 });
			const estimatedCost = faker.number.int({ min: 1000, max: 30000 });
			const sentenceProbability = faker.number.int({ min: 30, max: 100 });
			const operationalRisk = faker.number.int({ min: 1, max: 5 });

			let financialRisk;
			if (lawsuitProbability > 70 && estimatedCost > 10000) {
				financialRisk = faker.number.int({ min: 4, max: 5 });
			} else if (lawsuitProbability > 50 && estimatedCost > 5000) {
				financialRisk = faker.number.int({ min: 3, max: 4 });
			} else if (lawsuitProbability > 30) {
				financialRisk = faker.number.int({ min: 2, max: 3 });
			} else {
				financialRisk = faker.number.int({ min: 1, max: 2 });
			}

			const weightedRisk = (operationalRisk * 4 + financialRisk * 6) / 10;

			customerRisk.push({
				customerInternalId,
				date: conversation.createdAt,
				sentenceProbability,
				insatisfactionLevel,
				lawsuitProbability,
				estimatedCost,
				operationalRisk,
				financialRisk,
				weightedRisk,
				reason: conversation.reason
			});
		}

		return customerRisk;
	}

	private createLawsuits(customers: Customer[]): Lawsuit[] {
		const lawsuitsAmount = Math.floor(customers.length * 0.6);

		const lawsuits: Lawsuit[] = [];

		for (let i = 0; i < lawsuitsAmount; i++) {
			const oneMonthsAgo = new Date();
			oneMonthsAgo.setMonth(oneMonthsAgo.getMonth() - 1);

			const createdAt = faker.date.recent({ days: 180, refDate: oneMonthsAgo });
			const amountOfAttorneys = faker.number.int({ min: 1, max: 5 });
			const costHours = faker.number.int({ min: 1, max: 50 });
			const averageHourlyCost = faker.number.int({ min: 100, max: 300 });
			const operationalCost = costHours * averageHourlyCost;

			let resolvedAt;
			let decision;
			let averageMonthlyCost; // this value should be used to display monthly operational cost of the lawsuit
			if (Math.random() > 0.5) {
				resolvedAt = faker.date.between({ from: createdAt, to: new Date() });
				decision = faker.helpers.arrayElement(Object.values(LawsuitDecision));
				averageMonthlyCost = parseFloat(
					(operationalCost / (resolvedAt.getMonth() - createdAt.getMonth())).toFixed(2)
				); // if the lawsuit is resolved, the average monthly operational cost is calculated based on the months it took to resolve
			} else {
				resolvedAt = null;
				decision = null;
				averageMonthlyCost = parseFloat(
					(operationalCost / (new Date().getMonth() - createdAt.getMonth())).toFixed(2)
				); // if the lawsuit is not resolved, the average monthly operational cost is calculated based on the months it has been open
			}

			lawsuits.push({
				internalId: faker.string.uuid(),
				customerInternalId: customers[i].internalId,
				distributionDate: createdAt,
				archivedDate: resolvedAt,
				amountOfLawyers: amountOfAttorneys,
				lawyersAvgHourlyCost: averageHourlyCost,
				estimatedTotalHours: costHours,
				operationalCost: operationalCost,
				averageMonthlyCost,
				thesis: faker.helpers.arrayElement(Object.values(JuridicalThesis)),
				decision,
				damagesCost:
					decision === LawsuitDecision.Against ? faker.number.int({ min: 1000, max: 10000 }) : null
			});
		}

		return lawsuits;
	}

	private createConversations(customers: Customer[]): Conversation[] {
		const conversations: Conversation[] = [];

		customers.forEach((customer) => {
			const conversationsAmount = faker.number.int({ min: 1, max: 200 });
			for (let i = 0; i < conversationsAmount; i++) {
				const createdAt = faker.date.recent({ days: 365 });
				const sentiment = faker.helpers.arrayElement(Object.values(Sentiment));

				let sentimentGrade;
				switch (sentiment) {
					case Sentiment.Satisfaction:
						sentimentGrade = faker.number.float({ min: 4, max: 5, fractionDigits: 1 });
						break;
					case Sentiment.Frustration:
						sentimentGrade = faker.number.float({ min: 2, max: 3.9, fractionDigits: 1 });
						break;
					case Sentiment.Irritation:
						sentimentGrade = faker.number.float({ min: 1, max: 1.9, fractionDigits: 1 });
						break;
				}

				conversations.push({
					internalId: faker.string.uuid(),
					customerInternalId: customer.internalId,
					createdAt,
					sentiment,
					sentimentGrade,
					reason: faker.helpers.arrayElement(Object.values(JuridicalThesis))
				});
			}
		});

		return conversations;
	}
}

// each interface represents an entity in the database
interface Customer {
	internalId: string;
	name: string;
	litigantExperience: LitigantExperience;
}

interface CustomerRisk {
	customerInternalId: string;
	date: Date;
	lawsuitProbability: number;
	operationalRisk: number;
	financialRisk: number;
	weightedRisk: number;
	estimatedCost: number;
	sentenceProbability: number;
	insatisfactionLevel: number;
	reason: JuridicalThesis;
}

interface Lawsuit {
	internalId: string;
	customerInternalId: string;
	distributionDate: Date;
	archivedDate: Date | null;
	amountOfLawyers: number;
	lawyersAvgHourlyCost: number;
	estimatedTotalHours: number;
	operationalCost: number;
	averageMonthlyCost: number;
	thesis: JuridicalThesis;
	decision: LawsuitDecision | null;
	damagesCost: number | null;
}

interface Conversation {
	internalId: string;
	customerInternalId: string;
	createdAt: Date;
	sentiment: Sentiment;
	sentimentGrade: number;
	reason: JuridicalThesis;
}

enum JuridicalThesis {
	PublicidadeEnganosa = 'Publicidade Enganosa',
	VicioDeProduto = 'Vício de Produto',
	DescumprimentoDeOferta = 'Descumprimento de Oferta',
	CobrancaIndevida = 'Cobrança Indevida',
	ClausulasAbusivas = 'Cláusulas Abusivas',
	DireitoDeArrependimento = 'Direito de Arrependimento',
	AtendimentoInadequado = 'Atendimento Inadequado',
	ServicoNaoFornecido = 'Serviço Não Fornecido',
	DefeitoDeSeguranca = 'Defeito de Segurança'
}

enum LawsuitDecision {
	InFavor = 'Favorável',
	Against = 'Desfavorável'
}

enum LitigantExperience {
	Experienced = 'Experiente',
	Inexperienced = 'Iniciante',
	Impulsive = 'Impulsivo'
}

enum Sentiment {
	Satisfaction = 'Satisfação',
	Frustration = 'Frustração',
	Irritation = 'Irritação'
}

new FakeDeltaAiData(500);
