import {
	EventExtractPersonData,
	EventExtractPersonDataStatus
} from '../../../domain/entities/eventExtractPersonData';

export const EventExtractPersonDataMock = (isFinished = false) =>
	new EventExtractPersonData(
		'12345678900',
		isFinished ? EventExtractPersonDataStatus.FINISHED : EventExtractPersonDataStatus.PENDING,
		new Date('2025-01-01')
	);
