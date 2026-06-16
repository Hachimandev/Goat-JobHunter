import { useLazySearchUsersQuery } from "@/services/user/userApi";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { User } from "@/types/model";

export const useGroupUserSearch = () => {
  const { user } = useUser();
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 500);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const [triggerSearch, { data: searchData, isFetching: isLoading }] =
    useLazySearchUsersQuery();

  useEffect(() => {
    if (debouncedKeyword.length >= 2) {
      triggerSearch(debouncedKeyword);
    }
  }, [debouncedKeyword, triggerSearch]);

  const users = (searchData?.data?.result || []).filter(
    (u: User) => u.accountId !== user?.accountId,
  );

  const toggleUserSelection = (selectedUser: User) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.accountId === selectedUser.accountId);
      if (isSelected) {
        return prev.filter((u) => u.accountId !== selectedUser.accountId);
      } else {
        return [...prev, selectedUser];
      }
    });
  };

  const removeUser = (userId: number) => {
    setSelectedUsers((prev) => prev.filter((u) => u.accountId !== userId));
  };

  const reset = () => {
    setKeyword("");
    setSelectedUsers([]);
  };

  return {
    keyword,
    setKeyword,
    users,
    isLoading,
    selectedUsers,
    toggleUserSelection,
    removeUser,
    reset,
    shouldShowResults: keyword.length >= 2,
  };
};
