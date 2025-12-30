import type { Filter } from "@/types/filter.type";

export default function FilterOption({
  filter,
  onChange,
}: {
  filter: Filter;
  onChange: (id: string, value: string) => void;
}) {
  return (
    <div className="flex flex-col">
      <label className="text-xs text-gray-600 mb-1">{filter.label}</label>
      <select
        value={filter.value}
        onChange={(e) => onChange(filter.id, e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
      >
        {filter.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
