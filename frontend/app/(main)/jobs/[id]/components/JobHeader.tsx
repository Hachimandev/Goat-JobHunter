import { Badge } from '@/components/ui/badge';
import { CardContent } from '@/components/ui/card';
import { Job } from '@/types/model';
import { capitalize } from 'lodash';
import { useRouter } from 'next/navigation';

function JobHeader({ job, actions }: { readonly job: Job; readonly actions?: React.ReactNode }) {
  const router = useRouter();

  const handleTitleClick = () => {
    router.push(`/jobs/${job.jobId}`);
  };

  return (
    <CardContent className="p-6 pb-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-sm">
            {capitalize(job.level)}
          </Badge>
          <Badge variant={job.active ? 'default' : 'outline'} className="text-sm">
            {job.active ? 'Đang tuyển' : 'Đã đóng'}
          </Badge>
          <Badge variant="outline" className="text-sm">
            {capitalize(job.workingType)}
          </Badge>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      <h1
        className="text-2xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
        onClick={handleTitleClick}
      >
        {job.title}
      </h1>
    </CardContent>
  );
}

export default JobHeader;
