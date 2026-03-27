import { Option } from '@/components/ui/MultipleSelector';
import useSubscriberActions from '@/hooks/useSubcriberActions';
import { useGetSkillsQuery } from '@/services/skill/skillApi';
import { useGetCurrentUserSubscriberSkillsQuery } from '@/services/subcriber/subcriberApi';
import { Skill } from '@/types/model';
import { debounce } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

const useSkillSubscription = () => {
  const [selectedSkills, setSelectedSkills] = useState<Option[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [debouncedInputValue, setDebouncedInputValue] = useState<string>('');

  // Fetch subscriber skills
  const {
    data: subscriberResponse,
    isLoading: isLoadingSubscriber,
    isError: isErrorSubscriber,
    refetch: refetchSubscriber,
  } = useGetCurrentUserSubscriberSkillsQuery();

  // Fetch skills from API (only when user types)
  const { data: skillsData, isFetching: isFetchingSkills } = useGetSkillsQuery(
    {
      page: 1,
      size: 50,
      name: debouncedInputValue,
    },
    {
      skip: !debouncedInputValue || debouncedInputValue.length < 2,
    },
  );

  // Use subscriber actions hook
  const {
    isLoading: isUpdatingSubscriber,
    handleAddSkills,
    handleRemoveSkill,
  } = useSubscriberActions(subscriberResponse?.data);

  const subscriberData = subscriberResponse?.data;

  // Get subscribed skills
  const subscribedSkills = useMemo(() => subscriberData?.skills || [], [subscriberData]);

  // Convert API skills to options and filter out subscribed ones
  const skillOptions = useMemo<Option[]>(() => {
    if (!debouncedInputValue || debouncedInputValue.length < 2) return [];

    if (!skillsData?.data?.result) return [];

    return skillsData.data.result
      .filter((skill) => !subscribedSkills.map((s) => s.skillId).includes(skill.skillId))
      .map((skill) => ({
        label: skill.name,
        value: skill.skillId.toString(),
      }));
  }, [skillsData, subscribedSkills, debouncedInputValue]);

  // Debounced function to update search query
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedInputValue(value);
    }, 500),
    [],
  );

  // Handle input value change
  const handleInputValueChange = (value: string) => {
    setInputValue(value);
    debouncedSearch(value);
  };

  // Handle create subscription
  const handleCreateSubscription = async () => {
    try {
      if (selectedSkills.length === 0) {
        toast.error('Vui lòng chọn ít nhất một kỹ năng');
        return;
      }

      await handleAddSkills(selectedSkills.map((skill) => Number(skill.value)));

      setSelectedSkills([]);
      setInputValue('');
      setDebouncedInputValue('');
      refetchSubscriber();
    } catch (error) {
      console.error('Failed to create subscription:', error);
    }
  };

  // Handle unsubscribe
  const handleDeleteSubscription = async (skill: Skill) => {
    try {
      await handleRemoveSkill(skill.skillId);
      refetchSubscriber();
    } catch (error) {
      console.error('Failed to delete subscription:', error);
    }
  };

  // Check max limit when selecting
  const handleSkillChange = (newSkills: Option[]) => {
    const newTotalCount = subscribedSkills.length + newSkills.length;

    if (newTotalCount > 5) {
      toast.error('Tối đa 5 kỹ năng', {
        description: `Bạn đã đăng ký ${subscribedSkills.length} kỹ năng. Chỉ có thể thêm ${5 - subscribedSkills.length} kỹ năng nữa`,
      });
      return;
    }

    setSelectedSkills(newSkills);
  };

  return {
    selectedSkills,
    setSelectedSkills,
    refetchSubscriber,
    inputValue,
    handleInputValueChange,
    skillOptions,
    isFetchingSkills,
    subscribedSkills,
    isLoadingSubscriber,
    isUpdatingSubscriber,
    isErrorSubscriber,
    totalSkillsCount: subscribedSkills.length + selectedSkills.length,
    handleSkillChange,
    handleCreateSubscription,
    handleDeleteSubscription,
  };
};

export default useSkillSubscription;
