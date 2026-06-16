import { ApplicationsByYearChart, Top10BlogsChart, TotalStatisticsChart } from "@/app/(admin)/dashboard/components";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <h1 className="text-xl font-semibold">Thống kê hệ thống</h1>
            <p className="text-sm text-muted-foreground">
              Tổng quan về các số liệu quan trọng trong hệ thống
            </p>
          </div>
        </CardHeader>
        <CardContent className={"space-y-6"}>
          <TotalStatisticsChart />
          <ApplicationsByYearChart />
          <Top10BlogsChart />
        </CardContent>
      </Card>
    </div>
  );
}