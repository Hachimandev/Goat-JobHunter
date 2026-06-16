"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import RoleDialog from "./components/RoleDialog";
import { RoleTable } from "./components/RoleTable";
import { Button } from "@/components/ui/button";
import { useFetchRolesQuery } from "@/services/role/roleApi";
import LoaderSpin from "@/components/common/LoaderSpin";

const AdminRolePage = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading, isError } = useFetchRolesQuery({});

  const roles = useMemo(() => data?.data?.result || [], [data]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Quản lý vai trò</h1>
            <p className="text-sm text-muted-foreground">Quản lý tất cả vai trò trong hệ thống</p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl">
              <Plus className="w-4 h-4" /> Thêm vai trò
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-8">
              <LoaderSpin />
            </div>
          )}

          {
            isError ? (
              <div className="text-destructive">Có lỗi khi tải vai trò</div>
            ) : (
              <RoleTable roles={roles} />
            )
          }
        </CardContent>
      </Card>

      <RoleDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
};

export default AdminRolePage;