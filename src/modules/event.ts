export type Event = { id: string; start: Date; end: Date; title: string };

export type EventChange = { id: string; eventId: string } & (
  | { type: "change-end-date"; originalEnd: Date; newEnd: Date }
  | { type: "change-start-date"; originalStart: Date; newStart: Date }
);

export function applyChangeToEvent(event: Event, eventChanges: EventChange[]): Event {
  const changedEvent = { ...event };
  for (const eventChange of eventChanges) {
    switch (eventChange.type) {
      case "change-end-date": {
        changedEvent.end = eventChange.newEnd;
        break;
      }
      case "change-start-date": {
        // TODO
        break;
      }
    }
  }
  return changedEvent;
}
