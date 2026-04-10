'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useTop10Blogs } from '@/app/(admin)/dashboard/hooks/useDashboard';
import { Top10BlogsFilter } from '@/app/(admin)/dashboard/components/Top10BlogsFilter';
import LoaderSpin from '@/components/common/LoaderSpin';
import ErrorMessage from '@/components/common/ErrorMessage';
import { ApplicationYearFilter } from '@/app/(admin)/dashboard/components/ApplicationYearFilter';
import { extractPlainTextFromHtml } from '@/utils/extractPlainTextFromHtml';

const chartConfig: ChartConfig = {
  totalLikes: {
    label: 'Lượt thích',
    color: 'hsl(221.2 83.2% 53.3%)', // blue
  },
  totalComments: {
    label: 'Bình luận',
    color: 'hsl(24.6 95% 53.1%)', // green
  },
  totalReads: {
    label: 'Lượt đọc',
    color: 'hsl(142.1 76.2% 36.3%)', // orange
  },
};

export const Top10BlogsChart = () => {
  const { data, isLoading, isError, year, month, setYear, setMonth } = useTop10Blogs();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Thống kê tổng quan</h2>
        <LoaderSpin size={'xl'} />
      </div>
    );
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
          <ErrorMessage message={'Không có dữ liệu để hiển thị. Vui lòng thử lại sau.'} severity={'info'} />
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((blog) => {
    const source = blog.contentPreview || blog.content || `Bài viết #${blog.id}`;
    const plainContent = extractPlainTextFromHtml(source).trim() || `Bài viết #${blog.id}`;
    const label = plainContent.length > 30 ? `${plainContent.slice(0, 30)}...` : plainContent;

    return {
      label,
      totalLikes: blog.totalLikes,
      totalComments: blog.totalComments,
      totalReads: blog.totalReads,
    };
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top 10 bài viết</CardTitle>
          <Top10BlogsFilter year={year} month={month} onYearChange={setYear} onMonthChange={setMonth} />
        </div>
      </CardHeader>
      <CardContent>
        {isError && <ErrorMessage message={'Có lỗi xảy ra khi tải dữ liệu thống kê. Vui lòng thử lại sau.'} />}
        {!data ? (
          <div className="h-[800px] w-full flex items-center justify-center">
            <ErrorMessage
              message={'Không có dữ liệu để hiển thị. Vui lòng thử lại sau.'}
              variant={'compact'}
              severity={'info'}
            />
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[800px] w-full">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={'var(--secondary)'} />
              <XAxis type="number" />
              <YAxis dataKey="label" type="category" width={180} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="totalLikes" fill={chartConfig.totalLikes.color} radius={2} />
              <Bar dataKey="totalComments" fill={chartConfig.totalComments.color} radius={2} />
              <Bar dataKey="totalReads" fill={chartConfig.totalReads.color} radius={2} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
