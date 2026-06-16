import { Badge } from "@/components/ui/badge";
import { Job } from "@/types/model";
import { formatCurrency } from "@/utils/formatCurrency";
import { capitalize } from "lodash";
import { Building2 } from "lucide-react";

interface JobInfoSidebarProps {
  readonly job: Job;
}

function JobInfoSidebar({ job }: JobInfoSidebarProps) {
  const infoItems = [
    {
      label: "Cấp độ",
      value: (
        <Badge variant="secondary" className="capitalize">
          {capitalize(job.level)}
        </Badge>
      )
    },
    {
      label: "Hình thức",
      value: <Badge variant="outline">{capitalize(job.workingType)}</Badge>
    },
    { label: "Số lượng", value: `${job.quantity} vị trí` },
    {
      label: "Mức lương",
      value: `${formatCurrency(job.salary)}`,
      highlight: true
    }
  ];

  return (
    <div className="mt-6 pt-6 border-t border-border">
      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
        <Building2 className="w-5 h-5" />
        Thông Tin Công Việc
      </h3>
      <div className="flex flex-col">
        <div className="flex-1 space-y-3 mb-4">
          {infoItems.map((item, index) => (
            <div key={index + item.label} className="flex justify-between items-center">
              <span className="text-muted-foreground">{item.label}</span>
              <span
                className={item.highlight ? "text-primary font-semibold" : ""}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default JobInfoSidebar;
