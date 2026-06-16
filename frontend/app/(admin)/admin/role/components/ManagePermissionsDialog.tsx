"use client";
import type { Role } from "@/types/model";
import { useFetchPermissionsQuery } from "@/services/permission/permissionApi";
import ErrorMessage from "@/components/common/ErrorMessage";
import LoaderSpin from "@/components/common/LoaderSpin";
import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion";
import { capitalize } from "lodash";
import useManagePermissions from "@/app/(admin)/admin/role/hooks/useManagementPermissions";

interface ManagementPermissionDialogProps {
  readonly role: Role;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

export default function ManagePermissionsDialog({
                                                  role,
                                                  open,
                                                  onOpenChange
                                                }: ManagementPermissionDialogProps) {
  const { data, isLoading, isError } = useFetchPermissionsQuery({ size: 120 });
  const permissions = useMemo(() => data?.data?.result || [], [data]);

  const {
    modules,
    added,
    removed,
    hasPermission,
    togglePermission,
    toggleModulePermissions,
    handleSave,
    isUpdating
  } = useManagePermissions(role, permissions, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          max-w-4xl!
          max-h-[85vh]
          flex
          flex-col
          gap-0
          p-0
          overflow-hidden
        "
      >
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl">
            Quản lý quyền cho: <span className="font-semibold">{role.name || "-"}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="py-4 space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                  Quyền được thêm ({added.length})
                </h3>
                {added.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Không có</p>
                ) : (
                  <div className="max-h-32 overflow-y-auto rounded-lg border bg-muted/30 p-3">
                    <ul className="space-y-1 text-sm">
                      {added.map((p) => (
                        <li key={p.permissionId} className="flex items-start gap-2">
                          <span className="text-green-600 font-medium">+</span>
                          <span className="flex-1">
                            <span className="font-medium">{p.name}</span>
                            <span className="text-muted-foreground"> — {p.method} {p.apiPath}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                  Quyền bị bỏ ({removed.length})
                </h3>
                {removed.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Không có</p>
                ) : (
                  <div className="max-h-32 overflow-y-auto rounded-lg border bg-muted/30 p-3">
                    <ul className="space-y-1 text-sm">
                      {removed.map((p) => (
                        <li key={p.permissionId} className="flex items-start gap-2">
                          <span className="text-red-600 font-medium">−</span>
                          <span className="flex-1">
                            <span className="font-medium">{p.name}</span>
                            <span className="text-muted-foreground"> — {p.method} {p.apiPath}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t" />

            {isError && <ErrorMessage message="Có lỗi xảy ra khi tải quyền." />}

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <LoaderSpin />
              </div>
            )}

            {!isLoading && !isError && (
              <Accordion type="single" collapsible className="space-y-3">
                {Object.entries(modules).map(([moduleName, perms]) => (
                  <AccordionItem
                    key={moduleName}
                    value={moduleName}
                    className="rounded-xl border shadow-sm bg-card"
                  >
                    <AccordionTrigger
                      className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors rounded-t-xl">
                      <div className="flex items-center justify-between w-full pr-2">
                        <div className="flex items-center gap-3">
                          <div className="text-base font-semibold">
                            {capitalize(moduleName)}
                          </div>
                          <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted">
                            {perms.has}/{perms.total}
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Label
                            htmlFor={`module-${moduleName}`}
                            className="text-sm font-normal cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Chọn tất cả
                          </Label>
                          <Switch
                            id={`module-${moduleName}`}
                            checked={perms.has === perms.total && perms.total > 0}
                            onCheckedChange={(checked) =>
                              toggleModulePermissions(moduleName, checked)
                            }
                          />
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-4 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {perms.permissions.map((per) => (
                          <div
                            key={per.permissionId}
                            className="p-3 border rounded-lg flex items-start justify-between gap-3 hover:bg-muted/50 hover:border-primary/50 transition-colors group"
                          >
                            <div className="flex flex-col gap-1 min-w-0 flex-1">
                              <Label
                                className="font-medium text-sm cursor-pointer group-hover:text-primary transition-colors"
                                htmlFor={`perm-${per.permissionId}`}
                              >
                                {per.name}
                              </Label>
                              <span className="text-xs text-muted-foreground truncate">
                                <span className="font-mono font-semibold">{per.method}</span>
                                {" "}
                                {per.apiPath}
                              </span>
                            </div>

                            <Switch
                              id={`perm-${per.permissionId}`}
                              checked={hasPermission(per.permissionId)}
                              onCheckedChange={() => togglePermission(per)}
                              className="flex-shrink-0"
                            />
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}

                {Object.keys(modules).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">Không có quyền nào để hiển thị.</p>
                  </div>
                )}
              </Accordion>
            )}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 px-6 py-4 border-t bg-muted/10">
          <div className="flex items-center justify-between w-full gap-4">
            <div className="text-sm text-muted-foreground">
              {added.length > 0 && (
                <span className="text-green-600 font-medium">+{added.length}</span>
              )}
              {added.length > 0 && removed.length > 0 && <span className="mx-2">•</span>}
              {removed.length > 0 && (
                <span className="text-red-600 font-medium">−{removed.length}</span>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUpdating}
                className="rounded-xl"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSave}
                disabled={isUpdating || (added.length === 0 && removed.length === 0)}
                className="rounded-xl min-w-[120px]"
              >
                {isUpdating ? (
                  <>
                    <LoaderSpin />
                    Đang lưu...
                  </>
                ) : (
                  "Xác nhận"
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}