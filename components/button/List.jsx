import { ListFilter } from "lucide-react";

export default function ListBT({ onClick }) {
  return (
    <button
      className="flex items-center justify-center gap-2 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
      onClick={onClick}
      type="button"
    >
      <ListFilter className="w-4 h-4" />
      <span className="hidden md:inline">กรอง</span>
    </button>
  );
}
