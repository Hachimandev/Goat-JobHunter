import { Job } from "@/types/model";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { BriefcaseBusiness, Calendar, Clock, DollarSign, MapPin, Users } from "lucide-react";

function JobInfoGrid({ job }: { readonly job: Job }) {
  const infoItems = [
    {
      icon: DollarSign,
      label: "Lương",
      value: `${formatCurrency(job.salary)}`
    },
    {
      icon: Calendar,
      label: "Ngày bắt đầu",
      value: formatDate(job.startDate)
    },
    {
      icon: Clock,
      label: "Hạn nộp",
      value: formatDate(job.endDate)
    },
    {
      icon: Users,
      label: "Số lượng",
      value: `${job.quantity} vị trí`
    },
    {
      icon: BriefcaseBusiness,
      label: "Ngành nghề",
      value: job.career.name || "Chưa cung cấp"
    }
  ];

  return (
    <div className={"py-6"}>
      <div className="grid grid-cols-3 gap-4">
        {infoItems.map((item, index) => (
          <div key={index + item.label} className={`flex items-center space-x-2`}>
            <item.icon className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-base font-semibold text-muted-foreground">{item.label}</p>
              <p className="text-sm text-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className={"mt-6"}>
        <div className={`flex items-center space-x-2`}>
          <MapPin className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-base font-semibold text-muted-foreground">Địa điểm</p>
            <p className="text-sm text-foreground">{job.address.fullAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobInfoGrid;
