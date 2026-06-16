import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import MultipleSelector, { Option } from "@/components/ui/MultipleSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { LEVEL_OPTIONS, WORKING_TYPE_OPTIONS } from "@/constants/constant";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import RichTextEditor from "@/components/RichText/Editor";
import { JobFormData } from "@/components/legacy/schema";
import { useMemo } from "react";

interface JobFormProps {
  form: UseFormReturn<JobFormData>;
  onSubmit: (data: JobFormData) => void;
  skillOptions: Option[];
  careerOptions: Option[];
  inputValue: string;
  handleInputValueChange: (value: string) => void;
  isFetchingSkills: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isEditMode: boolean;
}

const JobForm = ({
 form,
 onSubmit,
 skillOptions,
 careerOptions,
 inputValue,
 handleInputValueChange,
 isFetchingSkills,
 isCreating,
 isUpdating,
 isEditMode
}: Readonly<JobFormProps>) => {

  const submitContent = useMemo(() => {
    const isSaving = isCreating || isUpdating;

    if (isSaving) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {isEditMode ? "Đang cập nhật..." : "Đang tạo..."}
        </>
      );
    }

    if (isEditMode) {
      return "Cập nhật công việc";
    }

    return "Tạo công việc";
  }, [isCreating, isEditMode, isUpdating]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Tiêu đề công việc</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Senior Full-stack Developer"
                      className="rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Mô tả công việc</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      {...field}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={"Mô tả chi tiết về công việc, yêu cầu, quyền lợi..."}
                    />
                  </FormControl>
                  <FormDescription>Tối thiểu 50 ký tự</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Địa điểm làm việc</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Hà Nội, Việt Nam"
                      className="rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chi tiết công việc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel required>Cấp độ</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-xl w-full">
                            <SelectValue placeholder="Chọn cấp độ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LEVEL_OPTIONS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="workingType"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel required>Hình thức</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-xl w-full">
                            <SelectValue placeholder="Chọn hình thức" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {WORKING_TYPE_OPTIONS.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Mức lương (VNĐ)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="VD: 20000000"
                        className="rounded-xl"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Số lượng</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="VD: 2"
                        className="rounded-xl"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Ngày bắt đầu</FormLabel>
                    <FormControl>
                      <Input type="date" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Ngày kết thúc</FormLabel>
                    <FormControl>
                      <Input type="date" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="career"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel required>Ngành nghề</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl w-full">
                        <SelectValue placeholder="Chọn ngành nghề" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {careerOptions.map((career) => (
                        <SelectItem key={career.value} value={career.value}>
                          {career.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Kỹ năng yêu cầu</FormLabel>
                  <FormControl>
                    <MultipleSelector
                      options={skillOptions}
                      value={field.value.map((skill) => ({
                        label: skill.name,
                        value: skill.skillId.toString()
                      }))}
                      onChange={(selectedOptions: Option[]) => {
                        field.onChange(
                          selectedOptions.map((opt) => ({
                            skillId: opt.value,
                            name: opt.label
                          }))
                        );
                      }}
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
                      className="rounded-xl"
                      hidePlaceholderWhenSelected
                      maxSelected={10}
                      onMaxSelected={(maxLimit) => {
                        console.log(
                          `Chỉ có thể chọn tối đa ${maxLimit} kỹ năng`
                        );
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Chọn 1-10 kỹ năng. Nhập ít nhất 2 ký tự để tìm kiếm.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            disabled={isCreating || isUpdating}
            onClick={() => {
              form.reset();
              form.clearErrors();
            }}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="rounded-xl"
            disabled={isCreating || isUpdating}
          >
            {submitContent}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default JobForm;