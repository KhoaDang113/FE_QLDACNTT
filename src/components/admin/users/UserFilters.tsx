import * as React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
}

export function UserFilters({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
}: UserFiltersProps) {
  return (
    <Card className="p-6">
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            className="pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setRoleFilter(e.target.value)
          }
          className="w-full md:w-48 px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="staff">Nhân viên</option>
          <option value="user">Khách hàng</option>
          <option value="shipper">Shipper</option>
        </select>
      </div>
    </Card>
  );
}
