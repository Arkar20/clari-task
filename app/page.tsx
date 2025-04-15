import Board from '@/components/board';

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold text-foreground">Task Board</h1>
        <Board />
      </div>
    </div>
  );
}