import {
  useActivateRoleMutation,
  useCreateRoleMutation,
  useDeactivateRoleMutation,
  useDeleteRoleMutation, useUpdateRoleMutation
} from "@/services/role/roleApi";
import { RoleFormValues } from "@/app/(admin)/admin/role/components/RoleDialog";
import { toast } from "sonner";
import { Permission, Role } from "@/types/model";
import {
  useCreatePermissionMutation,
  useDeletePermissionMutation,
  useUpdatePermissionMutation
} from "@/services/permission/permissionApi";
import { PermissionFormValues } from "@/app/(admin)/admin/permission/components/EditPermissionDialog";

const UseRoleAndPermissionActions = () => {
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();
  const [activateRole, { isLoading: isActivating }] = useActivateRoleMutation();
  const [deactivateRole, { isLoading: isDeactivating }] = useDeactivateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [createPermission, { isLoading: isCreatingPermission }] = useCreatePermissionMutation();
  const [updatePermission, { isLoading: isUpdatingPermission }] = useUpdatePermissionMutation();
  const [deletePermission, { isLoading:isDeletingPermission }] = useDeletePermissionMutation();

  const handleCreateRole = async (data: RoleFormValues) => {
    try {
      await createRole(data).unwrap();
      toast.success("Tạo vai trò thành công.");
    } catch (e) {
      console.error(e);
      toast.error("Đã có lỗi xảy ra khi tạo vai trò. Vui lòng thử lại.");
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    try {
      await deleteRole(roleId).unwrap();
      toast.success("Xóa vai trò thành công.");
    } catch (e) {
      console.error(e);
      toast.error("Đã có lỗi xảy ra khi xóa vai trò. Vui lòng thử lại.");
    }
  };

  const handleActivateRole = async (roleId: number) => {
    try {
      await activateRole(roleId).unwrap();
      toast.success("Kích hoạt vai trò thành công.");
    } catch (e) {
      console.error(e);
      toast.error("Đã có lỗi khi kích hoạt vai trò. Vui lòng thử lại.");
    }
  };

  const handleDeactivateRole = async (roleId: number) => {
    try {
      await deactivateRole(roleId).unwrap();
      toast.success("Vô hiệu hóa vai trò thành công.");
    } catch (e) {
      console.error(e);
      toast.error("Đã có lỗi khi vô hiệu hóa vai trò. Vui lòng thử lại.");
    }
  };

  const handleUpdateRole = async (updatedRole: Role) => {
    try {
      await updateRole(updatedRole).unwrap();
      toast.success("Cập nhật vai trò thành công.");
    } catch (e) {
      console.error(e);
      toast.error("Đã có lỗi khi cập nhật vai trò. Vui lòng thử lại.");
    }
  };

  const handleCreatePermission = async (data: PermissionFormValues) => {
    try {
      await createPermission(data).unwrap();
      toast.success("Tạo permission thành công.");
    } catch (e) {
      console.error(e);
      toast.error("Đã có lỗi xảy ra khi tạo permission. Vui lòng thử lại.");
    }
  }

  const handleUpdatePermission = async (data: Permission) => {
    try {
      await updatePermission(data).unwrap();
      toast.success("Cập nhật permission thành công.");
    } catch (e) {
      console.error(e);
      toast.error("Đã có lỗi xảy ra khi cập nhật permission. Vui lòng thử lại.");
    }
  }

  const handleDeletePermission = async (permissionId: number) => {
    try {
      await deletePermission(permissionId).unwrap();
      toast.success("Xóa permission thành công.");
    } catch (e) {
      console.error(e);
      toast.error("Đã có lỗi xảy ra khi xóa permission. Vui lòng thử lại.");
    }
  }

  return {
    handleCreateRole,
    handleDeleteRole,
    handleActivateRole,
    handleDeactivateRole,
    handleUpdateRole,
    handleCreatePermission,
    handleUpdatePermission,
    handleDeletePermission,

    isCreating,
    isDeleting,
    isActivating,
    isDeactivating,
    isUpdating,
    isCreatingPermission,
    isUpdatingPermission,
    isDeletingPermission,
  };
};
export default UseRoleAndPermissionActions;
