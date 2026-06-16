import { useState, useEffect } from 'react';
import { useDebounce } from '@/components/ui/MultipleSelector';
import { useLazySearchUsersQuery } from '@/services/user/userApi';
import { useUser } from '@/hooks/useUser';
import { useAppSelector } from '@/lib/hooks';
import { RelationshipState } from '@/services/friendship/friendshipType';

interface UseSearchUsersOptions {
  minLength?: number;
  debounceMs?: number;
}

export function useSearchUsers(options: UseSearchUsersOptions = {}) {
  const { minLength = 2, debounceMs = 500 } = options;
  const { user: currentUser } = useUser();
  const friendshipPairs = useAppSelector((state) => state.friendship.pairs);
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, debounceMs);

  const [trigger, { data, isLoading, isFetching, isError }] = useLazySearchUsersQuery();

  useEffect(() => {
    if (debouncedKeyword.length >= minLength) {
      trigger(debouncedKeyword);
    }
  }, [debouncedKeyword, trigger, minLength]);

  const users =
    data?.data?.result.filter((u) => {
      if (u.accountId === currentUser?.accountId) {
        return false;
      }

      const pair = friendshipPairs[String(u.accountId)];
      const isBlocked =
        pair?.blockedByMe || pair?.blockedByOther || pair?.relationshipState === RelationshipState.BLOCKED;

      return !isBlocked;
    }) || [];
  const shouldShowResults = debouncedKeyword.length >= minLength;
  const isEmpty = !isFetching && !isError && shouldShowResults && !isLoading && users.length === 0;

  return {
    keyword,
    setKeyword,
    users,
    isLoading: isLoading || isFetching,
    isError,
    isEmpty,
    shouldShowResults,
  };
}
