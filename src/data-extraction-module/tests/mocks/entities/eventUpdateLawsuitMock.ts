import {
	EventUpdateLawsuit,
	EventUpdateLawsuitStatus
} from '../../../domain/entities/eventUpdateLawsuit';

export const EventUpdateLawsuitMock = new EventUpdateLawsuit(
	'1234567-89.2021.8.26.0000',
	EventUpdateLawsuitStatus.PENDING,
	new Date()
);
