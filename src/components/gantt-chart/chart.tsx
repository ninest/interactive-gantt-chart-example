import { addDays, differenceInDays, eachDayOfInterval, formatDate, getDate, isMonday } from "date-fns";
import { ComponentProps, MouseEvent, useEffect, useId, useState } from "react";
import useMeasure from "react-use-measure";
import { dateFormatMonthDate, dateToString } from "../../utils/date";

type Event = { id: string; start: Date; end: Date; title: string };

type EventChange = { id: string; eventId: string } & (
  | { type: "change-end-date"; originalEnd: Date; newEnd: Date }
  | { type: "change-start-date"; originalStart: Date; newStart: Date }
);

function applyChangeToEvent(event: Event, eventChanges: EventChange[]): Event {
  const a=1
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

interface GanttChartProps {
  start: Date;
  end: Date;
  data: Event[];
}

export function GanttChart({ start, end, data }: GanttChartProps) {
  const days = eachDayOfInterval({ start, end });

  const [eventChanges, setEventChanges] = useState<EventChange[]>([]);
  const createChange = (change: EventChange) => {
    setEventChanges([...eventChanges, change]);
  };
  const removeChange = (changeId: string) => {
    setEventChanges([...eventChanges.filter((ec) => ec.id !== changeId)]);
  };

  const displayEvents = data.map((event) => {
    const changes = eventChanges.filter((ec) => ec.eventId === event.id);
    return applyChangeToEvent(event, changes);
  });

  return (
    <div>
      <section>
        {/* Calendar/timeline */}
        <div
          className="grid grid-rows-1 gap-2"
          style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
        >
          {days.map((day) => {
            const showDate = isMonday(day);
            const showMonth = getDate(day) <= 7; // only show month name once
            // const weekend = isWeekend(day);
            const dateDisplay = showDate ? (showMonth ? formatDate(day, "MMM d") : formatDate(day, "d")) : "";
            return (
              <div key={day.toISOString()} className="bg-gray-900 p-1 w-full rounded text-white text-xs">
                {dateDisplay}
              </div>
            );
          })}
        </div>
        {/* Data display: reset list of events every time eventChanges list changes using key */}
        <div className="mt-2 space-y-1" key={eventChanges.length}>
          {displayEvents.map((event) => {
            return <Event key={event.id} days={days} event={event} createChange={createChange} />;
          })}
        </div>
      </section>

      {/* List of changes */}
      <h2 className="mt-10 text-3xl font-bold">Changes</h2>
      <div className="mt-5 space-y-2">
        {eventChanges.length === 0 && (
          <div>
            <i>No changes.</i>
          </div>
        )}
        {eventChanges.map((ec) => {
          const event = data.find((e) => e.id === ec.eventId);
          return (
            <div key={ec.id} className="p-5 rounded border flex items-center justify-between">
              {ec.type === "change-end-date" && (
                <div>
                  <b>{event?.title}</b>: Change end date from {dateFormatMonthDate(ec.originalEnd)} to{" "}
                  {dateFormatMonthDate(ec.newEnd)}
                </div>
              )}
              <button onClick={() => removeChange(ec.id)}>remove</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Event({
  days,
  event,
  createChange,
  ...props
}: { days: Date[]; event: Event; createChange: (change: EventChange) => void } & ComponentProps<"div">) {
  const startCol = days.findIndex((day) => dateToString(day) === dateToString(event.start)) + 1;
  const endCol = days.findIndex((day) => dateToString(day) === dateToString(event.end)) + 2;

  const id = useId(); // id for creating event changes
  const [measureRef, bounds] = useMeasure();
  const [initialWidth, setInitialWidth] = useState(0); // original width of the component, should not change on resize
  const [width, setWidth] = useState(0); // current width of component, will change on resize

  useEffect(() => {
    if (bounds.width != 0 && width === 0) {
      setInitialWidth(bounds.width);
      setWidth(bounds.width);
    }
  }, [bounds]);

  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);
  const lengthInDays = differenceInDays(event.end, event.start);

  const handleMouseDown = (e: MouseEvent<HTMLElement>) => {
    setIsResizing(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (isResizing) {
      const currentX = e.clientX;
      const deltaX = currentX - startX!;
      setWidth(Math.max(100, width + deltaX));
      setStartX(currentX);
    }
  };

  const handleMouseUp = () => {
    if (isResizing) {
      setIsResizing(false);
      console.log(initialWidth);
      // Use change in width to calculate new length
      const newEventLengthInDays = Math.round((lengthInDays / initialWidth) * width);
      const newEndDate = addDays(event.start, newEventLengthInDays);
      createChange({ id, eventId: event.id, type: "change-end-date", originalEnd: event.end, newEnd: newEndDate });
    }
  };

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
      <div
        ref={measureRef}
        {...props}
        style={{ gridColumnStart: startCol, gridColumnEnd: endCol, width: width === 0 ? `unset` : `${width}px` }}
        className={`${props.className} bg-gray-100 border ${isResizing && `border-blue-600`} rounded`}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div className="h-full w-full flex items-center justify-between overflow-visible">
          {/* <div className="cursor-ew-resize h-full w-10 bg-gray-200" onMouseDown={handleMouseDown}></div> */}
          <div className="p-1 line-clamp-1 select-none">
            {event.title} ({formatDate(event.start, "d")}–{formatDate(event.end, "d")})
          </div>
          <div className="cursor-ew-resize h-full w-20 relative -right-10" onMouseDown={handleMouseDown}></div>
        </div>
      </div>
    </div>
  );
}
