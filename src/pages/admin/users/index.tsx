import { useState } from "react";
import { UserManagementTable } from "@/components/admin/users/UserManagementTable";
import { UserFilters } from "@/components/admin/users/UserFilters";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Quản lý User</h1>
              <p className="text-violet-100 mt-1">
                Quản lý nhân viên, khách hàng và admin
              </p>
            </div>
          </div>
          <Button className="gap-2 bg-white text-violet-600 hover:bg-violet-50 shadow-md">
            <Plus className="w-4 h-4" />
            Thêm User
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b bg-gray-50/50">
          <UserFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
          />
        </div>

        <UserManagementTable searchTerm={searchTerm} roleFilter={roleFilter} />
      </div>
    </div>
  );
}
