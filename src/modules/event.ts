import { addDays } from "date-fns";

export type Event = { id: string; start: Date; end: Date; title: string };

export type EventChange = { id: string; eventId: string } & (
  | { type: "change-end-date"; originalEnd: Date; newEnd: Date }
  | { type: "shift-by-days"; days: number }
);

export function applyChangeToEvent(event: Event, eventChanges: EventChange[]): Event {
  const changedEvent = { ...event };
  for (const eventChange of eventChanges) {
    switch (eventChange.type) {
      case "change-end-date": {
        changedEvent.end = eventChange.newEnd;
        break;
      }
      case "shift-by-days": {
        console.log("applying shift of ", eventChange.days);
        changedEvent.start = addDays(changedEvent.start, eventChange.days);
        changedEvent.end = addDays(changedEvent.end, eventChange.days);
        console.log({ changedEvent });
        break;
      }
    }
  }
  return changedEvent;
}

export function applyChangesToEvents(events: Event[], eventChanges: EventChange[]): Event[] {
  return events.map((event) => {
    const changes = eventChanges.filter((ec) => ec.eventId === event.id);
    return applyChangeToEvent(event, changes);
  });
}
