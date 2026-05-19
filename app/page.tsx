import DailyTracker from "./components/DailyTracker"; // Adjust path as needed

export default function Home() {
  return (
    <main className="w-full min-h-screen bg-zinc-950 overflow-x-hidden">
      <DailyTracker />
    </main>
  );
}