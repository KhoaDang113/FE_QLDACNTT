import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Edit2, Lock, Unlock, Loader2 } from "lucide-react";
import { userService } from "@/api";
import type { User, UserRole } from "@/types";
import { toast } from "sonner";

const roleColors = {
  user: "bg-green-100 text-green-800",
  staff: "bg-blue-100 text-blue-800",
  admin: "bg-red-100 text-red-800",
  shipper: "bg-purple-100 text-purple-800",
};

const roleLabels = {
  user: "Khách hàng",
  staff: "Nhân viên",
  admin: "Admin",
  shipper: "Shipper",
};

interface UserTableProps {
  searchTerm: string;
  roleFilter: string;
}

export function UserManagementTable({
  searchTerm,
  roleFilter,
}: UserTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole | "">("");
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        role: roleFilter !== "all" ? (roleFilter as UserRole) : undefined,
      };

      const response = await userService.getAllUsers(params);
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách user");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users when filters or pagination changes
  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, pagination.page]);

  // Handle toggle user status (lock/unlock)
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const user = users.find((u) => u._id === userId);
    if (!user) return;

    if (user.role === "admin") {
      toast.error("Không thể khóa tài khoản Admin!");
      return;
    }

    const action = currentStatus ? "khóa" : "mở khóa";
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} user "${user.name}"?`)) {
      return;
    }

    try {
      setActionLoading(userId);

      if (currentStatus) {
        await userService.lockUser(userId);
      } else {
        await userService.unlockUser(userId);
      }

      // Refresh users list after action
      await fetchUsers();
    } catch (err: any) {
      console.error("Error toggling user status:", err);
      toast.error(
        err.response?.data?.message || `Không thể ${action} user. Vui lòng thử lại.`
      );
    } finally {
      setActionLoading(null);
    }
  };



  // Handle open edit dialog
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setNewRole(user.role);
  };

  // Handle update user role
  const handleUpdateRole = async () => {
    if (!editingUser || !newRole) return;

    try {
      setIsUpdateLoading(true);
      await userService.updateUserByAdmin(editingUser._id, {
        role: newRole as UserRole,
      });

      // Close dialog and refresh list
      setEditingUser(null);
      await fetchUsers();
    } catch (err: any) {
      console.error("Error updating user role:", err);
      toast.error(
        err.response?.data?.message || "Không thể cập nhật vai trò user"
      );
    } finally {
      setIsUpdateLoading(false);
    }
  };

  // Format date
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  if (loading && users.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Đang tải danh sách user...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchUsers}>Thử lại</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Danh sách User ({pagination.total})
        </h3>
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <div className="max-h-[600px] overflow-y-auto border rounded-lg">
          <table className="admin-table w-full">
            <thead className="sticky top-0 bg-background">
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(user => user.role !== 'admin').map((user) => (
                <tr key={user._id}>
                  <td className="font-medium text-foreground">
                    {user._id.slice(-6)}
                  </td>
                  <td className="text-foreground">{user.name}</td>
                  <td className="text-muted-foreground max-w-[150px] truncate" title={user.email}>
                    {user.email || "N/A"}
                  </td>
                  <td className="text-muted-foreground">
                    {user.phone || "N/A"}
                  </td>
                  <td>
                    <Badge className={roleColors[user.role]}>
                      {roleLabels[user.role]}
                    </Badge>
                  </td>
                  <td>
                    <Badge
                      className={
                        user.isLocked
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {user.isLocked ? "Bị khóa" : "Hoạt động"}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </td>
                  <td>
                    <div className="flex gap-2 whitespace-nowrap flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 w-20 flex-shrink-0"
                        onClick={() => handleEditClick(user)}
                      >
                        <Edit2 className="w-4 h-4" />
                        Sửa
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 w-24 flex-shrink-0"
                        onClick={() => handleToggleStatus(user._id, !user.isLocked)}
                        disabled={actionLoading === user._id || user.role === "admin"}
                      >
                        {actionLoading === user._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : user.isLocked ? (
                          <>
                            <Unlock className="w-4 h-4" />
                            Mở khóa
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Khóa
                          </>
                        )}
                      </Button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Không tìm thấy user nào</p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Trang {pagination.page} / {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1 || loading}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page === pagination.totalPages || loading}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Edit Role Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật vai trò người dùng</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Tên người dùng</Label>
              <div className="p-2 bg-muted rounded-md text-sm">
                {editingUser?.name}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="p-2 bg-muted rounded-md text-sm">
                {editingUser?.email || "N/A"}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Vai trò</Label>
              <Select
                value={newRole}
                onValueChange={(value) => setNewRole(value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Khách hàng</SelectItem>
                  <SelectItem value="staff">Nhân viên</SelectItem>
                  <SelectItem value="shipper">Shipper</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingUser(null)}
              disabled={isUpdateLoading}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdateRole} disabled={isUpdateLoading}>
              {isUpdateLoading && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

