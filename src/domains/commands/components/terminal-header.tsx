export function TerminalHeader() {
  return (
    <div className="flex items-center gap-1.5 rounded-t-md bg-gray-800 px-3 py-2">
      <div className="h-3 w-3 rounded-full bg-red-500" />
      <div className="h-3 w-3 rounded-full bg-yellow-500" />
      <div className="h-3 w-3 rounded-full bg-green-500" />
    </div>
  );
}
