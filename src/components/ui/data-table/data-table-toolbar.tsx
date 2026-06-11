import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  toolbar?: React.ReactNode;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  toolbar,
}: Readonly<DataTableToolbarProps>) {
  const hasSearch = !!searchPlaceholder;
  const hasToolbar = !!toolbar;

  if (!hasSearch && !hasToolbar) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {hasSearch && (
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          prefix={<Search />}
          className="max-w-xs"
        />
      )}
      {hasToolbar && (
        <div className="flex items-center gap-2">{toolbar}</div>
      )}
    </div>
  );
}
