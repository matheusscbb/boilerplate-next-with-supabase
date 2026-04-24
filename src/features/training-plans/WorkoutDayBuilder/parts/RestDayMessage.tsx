import { MoonIcon } from '../icons';

/** Empty-state shown inside a day card flagged as rest. */
export function RestDayMessage() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground">
      <MoonIcon className="h-8 w-8 opacity-40" />
      <p className="text-sm font-medium">Dia de descanso</p>
      <p className="text-xs opacity-70">Nenhum exercício programado.</p>
    </div>
  );
}
