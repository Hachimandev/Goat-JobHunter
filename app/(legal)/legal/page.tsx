import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LEGAL_PAGES = [
  {
    href: '/legal/terms-of-service',
    title: 'Điều khoản dịch vụ',
    description:
      'Quy định về sử dụng tài khoản, an toàn nhắn tin, tính minh bạch tuyển dụng và cơ chế thực thi trên nền tảng.',
  },
  {
    href: '/legal/user-policy',
    title: 'Chính sách người dùng',
    description:
      'Cách dữ liệu người dùng được thu thập, xử lý, chia sẻ, lưu trữ và bảo vệ trong các luồng social, chat và việc làm.',
  },
  {
    href: '/legal/community-standards',
    title: 'Tiêu chuẩn cộng đồng',
    description:
      'Chuẩn hành vi và nội dung nhằm giữ môi trường trò chuyện, tương tác xã hội và tuyển dụng an toàn, chuyên nghiệp.',
  },
] as const;

export const metadata: Metadata = {
  title: 'Trung tâm pháp lý | GOAT Job Hunter',
  description: 'Tổng hợp tài liệu pháp lý cho hệ sinh thái mạng xã hội, trò chuyện và việc làm của GOAT Job Hunter.',
};

export default function LegalCenterPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Trung tâm pháp lý</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
          Quy định nền tảng và quyền lợi người dùng
        </h1>
        <p className="mt-4 w-full text-sm leading-6 text-muted-foreground sm:text-base">
          Trung tâm pháp lý này quy định cách GOAT Job Hunter vận hành trên các tính năng mạng xã hội, chat cá nhân,
          chat nhóm, hội thoại có hỗ trợ AI và quy trình tuyển dụng. Tài liệu pháp lý dành cho nền tảng mạng xã hội, trò
          chuyện và tuyển dụng GOAT Job Hunter.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Ngày hiệu lực: 2026-04-16</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LEGAL_PAGES.map((page) => (
          <Card key={page.href} className="border-border bg-card/80">
            <CardHeader>
              <CardTitle className="text-lg">{page.title}</CardTitle>
              <CardDescription>{page.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={page.href} className="text-sm font-medium text-primary hover:underline">
                Xem tài liệu
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
