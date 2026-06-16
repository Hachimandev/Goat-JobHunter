import BadgeItem from "@/app/(main)/profile/components/ProfileEmailNotification/BadgeItem";
import useSkillSubscription from "@/app/(main)/profile/components/ProfileEmailNotification/useSkillSubcription";
import ErrorMessage from "@/components/common/ErrorMessage";
import LoaderSpin from "@/components/common/LoaderSpin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MultipleSelector from "@/components/ui/MultipleSelector";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const SkillSubscription = () => {
  const {
    selectedSkills,
    inputValue,
    refetchSubscriber,
    handleInputValueChange,
    skillOptions,
    isFetchingSkills,
    subscribedSkills,
    isLoadingSubscriber,
    isUpdatingSubscriber,
    isErrorSubscriber,
    totalSkillsCount,
    handleSkillChange,
    handleCreateSubscription,
    handleDeleteSubscription,
  } = useSkillSubscription();

  if (isLoadingSubscriber) {
    return <LoaderSpin />;
  }

  if (isErrorSubscriber) {
    return (
      <ErrorMessage
        message="Đã có lỗi xảy ra khi tải thông tin đăng ký. Vui lòng thử lại sau"
        onRetry={refetchSubscriber}
      />
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-foreground mb-2">
        Kỹ năng đã đăng ký ({subscribedSkills.length}/5)
      </h2>
      <p className="text-sm text-green-600 mb-4">
        Đăng ký Job Robot để không bỏ lỡ việc làm phù hợp với kỹ năng của bạn.
      </p>

      <div className="flex gap-2">
        <MultipleSelector
          options={skillOptions}
          value={selectedSkills}
          onChange={handleSkillChange}
          inputValue={inputValue}
          onInputValueChange={handleInputValueChange}
          placeholder="Nhập tên kỹ năng..."
          loadingIndicator={
            isFetchingSkills && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Đang tìm kiếm...
                </span>
              </div>
            )
          }
          emptyIndicator={
            <p className="text-center text-sm text-muted-foreground py-2">
              {inputValue.length < 2
                ? "Nhập ít nhất 2 ký tự để tìm kiếm"
                : "Không tìm thấy kỹ năng"}
            </p>
          }
          className="rounded-xl flex-1"
          hidePlaceholderWhenSelected
          disabled={subscribedSkills.length >= 5 || isUpdatingSubscriber}
          maxSelected={5 - subscribedSkills.length}
          onMaxSelected={(maxLimit) => {
            toast.error(`Chỉ có thể thêm tối đa ${maxLimit} kỹ năng`);
          }}
        />
        <Button
          onClick={handleCreateSubscription}
          disabled={
            selectedSkills.length === 0 ||
            totalSkillsCount > 5 ||
            isUpdatingSubscriber
          }
          className="rounded-xl bg-green-600 hover:bg-green-700"
        >
          {isUpdatingSubscriber ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Đang xử lý...
            </>
          ) : (
            "Đăng ký"
          )}
        </Button>
      </div>

      {subscribedSkills.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Đã đăng ký:
          </p>
          <div className="flex flex-wrap gap-2">
            {subscribedSkills.map((skill) => (
              <BadgeItem
                key={skill.skillId}
                item={skill}
                onRemove={() => handleDeleteSubscription(skill)}
                disabled={isUpdatingSubscriber}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 text-center py-8 border-2 border-dashed border-border rounded-xl">
          <p className="text-sm text-muted-foreground">
            Chưa có kỹ năng nào được đăng ký
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Hãy chọn kỹ năng và nhấn &quot;Đăng ký&quot; để nhận thông báo việc
            làm
          </p>
        </div>
      )}

      {subscribedSkills.length >= 5 && (
        <div className="mt-4 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl">
          <p className="font-medium">Đã đạt giới hạn tối đa</p>
          <p className="text-xs mt-1">
            Bạn chỉ có thể đăng ký tối đa 5 kỹ năng. Hãy xóa một kỹ năng để thêm
            kỹ năng mới.
          </p>
        </div>
      )}
    </Card>
  );
};

export default SkillSubscription;
