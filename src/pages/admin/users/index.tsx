import { useState } from "react";
import { UserManagementTable } from "@/components/admin/users/UserManagementTable";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý User</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý nhân viên, khách hàng và admin
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Thêm User
        </Button>
      </div>

      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />

      <UserManagementTable searchTerm={searchTerm} roleFilter={roleFilter} />
    </div>
  );
}

