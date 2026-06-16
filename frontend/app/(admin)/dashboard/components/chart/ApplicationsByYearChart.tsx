"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer, ChartLegend, ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useApplicationsByYear } from "@/app/(admin)/dashboard/hooks/useDashboard";
import { ApplicationYearFilter } from "@/app/(admin)/dashboard/components/ApplicationYearFilter";
import LoaderSpin from "@/components/common/LoaderSpin";
import ErrorMessage from "@/components/common/ErrorMessage";

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
];

export const ApplicationsByYearChart = () => {
  const { data, isLoading, isError, year, setYear } = useApplicationsByYear();

  if (isLoading) {
    return <div className="space-y-4">
      <h2 className="text-2xl font-bold">Thống kê tổng quan</h2>
      <LoaderSpin size={"xl"} />
    </div>;
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ứng tuyển theo năm</CardTitle>
            <ApplicationYearFilter year={year} onYearChange={setYear} />
          </div>
        </CardHeader>
        <CardContent>
          <ErrorMessage message={"Không có dữ liệu để hiển thị. Vui lòng thử lại sau."} severity={"info"} />
        </CardContent>
      </Card>
    );
  }

  const chartData = MONTH_NAMES.map((month, index) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const monthData: any = { month };
    Object.keys(data).forEach((status) => {
      monthData[status] = data[status][index + 1] || 0;
    });
    return monthData;
  });

  const chartConfig: ChartConfig = Object.keys(data).reduce((acc, status, index) => {
    const colors = [
      "hsl(221.2 83.2% 53.3%)", // blue
      "hsl(142.1 76.2% 36.3%)", // green
      "hsl(346.8 77.2% 49.8%)"  // red
    ];
    acc[status] = {
      label: status,
      color: colors[index % colors.length]
    };
    return acc;
  }, {} as ChartConfig);


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Ứng tuyển theo năm</CardTitle>
          <ApplicationYearFilter year={year} onYearChange={setYear} />
        </div>
      </CardHeader>
      <CardContent>
        {isError && <ErrorMessage message={"Có lỗi xảy ra khi tải dữ liệu thống kê. Vui lòng thử lại sau."} />}
        {data &&
          <ChartContainer config={chartConfig} className="h-[500px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={"var(--secondary)"} />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />}  />
              {Object.keys(data).map((status) => (
                <Bar
                  key={status}
                  dataKey={status}
                  fill={chartConfig[status].color}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ChartContainer>}
      </CardContent>
    </Card>
  );
};