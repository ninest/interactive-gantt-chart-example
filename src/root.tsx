import { GanttChart } from "./components/gantt-chart/chart";

export function Root() {
  const data = [
    { id: "1", start: new Date("2024-01-04"), end: new Date("2024-01-15"), title: "First event" },
    { id: "2", start: new Date("2024-01-12"), end: new Date("2024-01-31"), title: "Second event" },
  ];
  return (
    <main className="p-5">
      <h1 className="text-5xl font-black">Gantt Chart Example</h1>

      <div className="mt-5">
        <GanttChart start={new Date("2023-12-25")} end={new Date("2024-02-5")} data={data} />
      </div>
    </main>
  );
}
