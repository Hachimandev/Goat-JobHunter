import { useCallback, useEffect, useMemo, useState } from "react";
import type { Permission, Role } from "@/types/model";
import useRoleAndPermissionActions from "@/hooks/useRoleAndPermissionActions";

interface ModuleGroup {
  permissions: Permission[];
  total: number;
  has: number;
}

export default function useManagePermissions(
  role: Role | undefined,
  permissions: Permission[] = [],
  open = false
) {
  const { handleUpdateRole, isUpdating } = useRoleAndPermissionActions();

  const initialPermissions = useMemo(() => role?.permissions || [], [role?.permissions]);
  const [current, setCurrent] = useState<Permission[]>(initialPermissions);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrent(initialPermissions);
    }
  }, [open, initialPermissions]);

  // KEY FIX: Derive modules from current state, not role.permissions
  const modules = useMemo(() => {
    const mods: Record<string, ModuleGroup> = {};
    const currentIds = new Set(current.map(p => p.permissionId));

    permissions.forEach((per) => {
      const moduleName = per.module || "Chung";
      if (!mods[moduleName]) {
        mods[moduleName] = { permissions: [], total: 0, has: 0 };
      }
      mods[moduleName].permissions.push(per);
      mods[moduleName].total += 1;
      // Use current state instead of role.permissions
      if (currentIds.has(per.permissionId)) {
        mods[moduleName].has += 1;
      }
    });
    return mods;
  }, [permissions, current]); // Add current to dependencies

  const { added, removed } = useMemo(() => {
    const initialIds = new Set(initialPermissions.map(p => p.permissionId));
    const currentIds = new Set(current.map(p => p.permissionId));

    const addedList = current.filter(p => !initialIds.has(p.permissionId));
    const removedList = initialPermissions.filter(p => !currentIds.has(p.permissionId));

    return { added: addedList, removed: removedList };
  }, [current, initialPermissions]);

  const hasPermission = useCallback(
    (id: number) => current.some(p => p.permissionId === id),
    [current]
  );

  const togglePermission = useCallback((per: Permission) => {
    setCurrent(prev => {
      const exists = prev.some(p => p.permissionId === per.permissionId);
      if (exists) {
        return prev.filter(p => p.permissionId !== per.permissionId);
      }
      return [...prev, per];
    });
  }, []);

  const toggleModulePermissions = useCallback((moduleName: string, checked: boolean) => {
    const modulePerms = modules[moduleName];
    if (!modulePerms) return;

    setCurrent(prev => {
      const prevIds = new Set(prev.map(p => p.permissionId));

      if (checked) {
        const toAdd = modulePerms.permissions.filter(p => !prevIds.has(p.permissionId));
        return [...prev, ...toAdd];
      } else {
        const modulePermIds = new Set(modulePerms.permissions.map(p => p.permissionId));
        return prev.filter(p => !modulePermIds.has(p.permissionId));
      }
    });
  }, [modules]);

  const handleSave = async () => {
    if (!role) return;
    const updatedRole: Role = { ...role, permissions: current };
    await handleUpdateRole(updatedRole);
  };

  return {
    modules,
    current,
    added,
    removed,
    isUpdating,
    hasPermission,
    togglePermission,
    toggleModulePermissions,
    handleSave,
  };
}