import {
  useCreateCareerMutation,
  useUpdateCareerMutation,
  useDeleteCareerMutation
} from "@/services/career/careerApi";
import {
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation
} from "@/services/skill/skillApi";
import { CareerNameRequest, UpdateCareerRequest } from "@/services/career/careerType";
import { SkillNameRequest, UpdateSkillRequest } from "@/services/skill/skillType";
import { toast } from "sonner";

export default function useSkillAndCareerActions() {
  // Career mutations
  const [createCareer, { isLoading: isCreatingCareer }] = useCreateCareerMutation();
  const [updateCareer, { isLoading: isUpdatingCareer }] = useUpdateCareerMutation();
  const [deleteCareer, { isLoading: isDeletingCareer }] = useDeleteCareerMutation();

  // Skill mutations
  const [createSkill, { isLoading: isCreatingSkill }] = useCreateSkillMutation();
  const [updateSkill, { isLoading: isUpdatingSkill }] = useUpdateSkillMutation();
  const [deleteSkill, { isLoading: isDeletingSkill }] = useDeleteSkillMutation();

  // Career handlers
  const handleCreateCareer = async (data: CareerNameRequest) => {
    try {
      const result = await createCareer(data).unwrap();
      if (result.statusCode === 201) {
        toast.success("Tạo ngành nghề thành công");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo ngành nghề. Vui lòng thử lại.");
      console.error(error);
    }
  };

  const handleUpdateCareer = async (data: UpdateCareerRequest) => {
    try {
      const result = await updateCareer(data).unwrap();
      if (result.statusCode === 200) {
        toast.success("Cập nhật ngành nghề thành công");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật ngành nghề. Vui lòng thử lại.");
      console.error(error);
    }
  };

  const handleDeleteCareers = async (careerIds: number[]) => {
    try {
      await Promise.all(careerIds.map(async careerId => await deleteCareer(careerId)));
      toast.success("Xóa ngành nghề thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa ngành nghề. Vui lòng thử lại.");
      console.error(error);
    }
  };

  // Skill handlers
  const handleCreateSkill = async (data: SkillNameRequest) => {
    try {
      const result = await createSkill(data).unwrap();
      if (result.statusCode === 201) {
        toast.success("Tạo kỹ năng thành công");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo kỹ năng. Vui lòng thử lại.");
      console.error(error);
    }
  };

  const handleUpdateSkill = async (data: UpdateSkillRequest) => {
    try {
      const result = await updateSkill(data).unwrap();
      if (result.statusCode === 200) {
        toast.success("Cập nhật kỹ năng thành công");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật kỹ năng. Vui lòng thử lại.");
      console.error(error);
    }
  };

  const handleDeleteSkills = async (skillIds: number[]) => {
    try {
      await Promise.all(skillIds.map(async skillId => await deleteSkill(skillId)));
      toast.success("Xóa kỹ năng thành công");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa kỹ năng. Vui lòng thử lại.");
      console.error(error);
    }
  };

  return {
    // Career
    handleCreateCareer,
    handleUpdateCareer,
    handleDeleteCareers,
    isCreatingCareer,
    isUpdatingCareer,
    isDeletingCareer,
    // Skill
    handleCreateSkill,
    handleUpdateSkill,
    handleDeleteSkills,
    isCreatingSkill,
    isUpdatingSkill,
    isDeletingSkill
  };
}