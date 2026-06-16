import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Tag } from "lucide-react";

interface PopularTagsProps {
  readonly popularTags: [string, number][];
}

export function PopularTags({
  popularTags
}: PopularTagsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">
            Từ Khóa Nổi Bật
          </h3>
        </div>
      </CardHeader>
      <CardContent>
        {popularTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {popularTags
              .map((item) => item[0])
              .map((tag) => (
                <Link
                  key={tag}
                  href={`/blogs?tags=${encodeURIComponent(tag)}`}
                  className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                >
                  {tag}
                </Link>
              ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Chưa có tag nào
          </p>
        )}
      </CardContent>
    </Card>
  );
}
