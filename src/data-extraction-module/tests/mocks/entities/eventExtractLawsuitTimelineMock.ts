import { EventExtractLawsuitTimeline, EventExtractLawsuitTimelineStatus } from "../../../domain/entities/eventExtractLawsuitTimeline";

export const EventExtractLawsuitTimelineMock = new EventExtractLawsuitTimeline(
  '0000000-00.0000.0.00.0000',
  EventExtractLawsuitTimelineStatus.PENDING,
  new Date(),
);
