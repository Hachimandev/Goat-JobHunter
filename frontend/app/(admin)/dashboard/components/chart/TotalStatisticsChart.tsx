"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, ClipboardList, BookOpen, LucideProps } from "lucide-react";
import { useTotalStatistics } from "@/app/(admin)/dashboard/hooks/useDashboard";
import LoaderSpin from "@/components/common/LoaderSpin";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import ErrorMessage from "@/components/common/ErrorMessage";

const StatCard = ({
  title,
  value,
  icon: Icon
}: {
  title: string;
  value: number;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}) => (
  <Card className={"gap-2"}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0">
      <CardTitle className="text-base font-semibold">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-primary">{value}</div>
    </CardContent>
  </Card>
);

export const TotalStatisticsChart = () => {
  const { data, isLoading, isError } = useTotalStatistics();

  if (isLoading) {
    return <div className="space-y-4">
      <h2 className="text-2xl font-bold">Thống kê tổng quan</h2>
      <div className={"flex gap-2"}>
        {[1, 2, 3, 4, 5].map((item) => {
          return (
            <LoaderSpin key={item} />
          )
        })}
      </div>
    </div>;
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Thống kê tổng quan</h2>
        <ErrorMessage message={"Không có dữ liệu để hiển thị. Vui lòng thử lại sau."} severity={"info"} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Thống kê tổng quan</h2>
      {isError && <ErrorMessage message={"Có lỗi xảy ra khi tải dữ liệu thống kê. Vui lòng thử lại sau."} />}
      {data && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Số lượng ứng viên"
            value={data.users?.applicants}
            icon={Users}
          />
          <StatCard
            title="Số lượng nhà tuyển dụng"
            value={data.users?.recruiters}
            icon={Users}
          />
          <StatCard title="Số lượng công việc" value={data?.totalJobs} icon={Briefcase} />
          <StatCard
            title="Số lượng đơn ứng tuyển"
            value={data?.totalApplications}
            icon={ClipboardList}
          />
          <StatCard title="Số lượng bài viết" value={data?.totalBlogs} icon={BookOpen} />
        </div>
      )}
    </div>
  )
    ;
};