import type { Metadata } from 'next';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Tiêu chuẩn cộng đồng | GOAT Job Hunter',
  description: 'Tiêu chuẩn hành vi và nội dung cộng đồng trên GOAT Job Hunter.',
};

export default function CommunityStandardsPage() {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Tài liệu pháp lý</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Tiêu chuẩn cộng đồng</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Các tiêu chuẩn này áp dụng cho hồ sơ cá nhân, nội dung việc làm, tin nhắn, thảo luận nhóm, bình luận và nội
          dung media được chia sẻ trên hệ sinh thái GOAT.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Ngày hiệu lực: 2026-04-16</p>
      </header>

      <Separator className="my-6" />

      <section className="space-y-6 text-sm leading-6 text-foreground">
        <div>
          <h2 className="text-lg font-semibold">1. Giao tiếp tôn trọng</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Không quấy rối, phát ngôn thù ghét, đe dọa, bóc lột tình dục hoặc hạ nhục người khác.</li>
            <li>Không theo dõi làm phiền hoặc liên hệ lặp lại ngoài mong muốn trong chat cá nhân hay nhóm.</li>
            <li>Không chia sẻ thông tin cá nhân riêng tư của người khác khi chưa có sự đồng ý.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">2. Hành vi tuyển dụng an toàn</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Không đăng cơ hội việc làm giả hoặc mô tả yêu cầu công việc gây hiểu sai.</li>
            <li>
              Không tạo lời mời tuyển dụng lừa đảo để yêu cầu tiền, thông tin ngân hàng hoặc chuyển khoản bất thường.
            </li>
            <li>Không phân biệt đối xử, ép buộc hoặc ứng xử phỏng vấn mang tính lạm dụng.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">3. Hạn chế về nội dung và media</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Không phát tán tệp mã độc, liên kết phishing hoặc tệp đính kèm gây hại.</li>
            <li>Không chia sẻ nội dung bạo lực hoặc tình dục phản cảm ngoài phạm vi hợp pháp và đúng chính sách.</li>
            <li>Không spam hàng loạt, tạo tương tác giả hoặc thao túng hoạt động cộng đồng.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">4. Giới hạn AI và tự động hóa</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Không lạm dụng công cụ AI để tạo hồ sơ ứng tuyển giả mạo hoặc nội dung mạo danh.</li>
            <li>Không tự động hóa hành vi quấy rối hoặc phối hợp thao túng bằng kịch bản máy.</li>
            <li>Người dùng vẫn chịu trách nhiệm với nội dung được tạo bằng hỗ trợ AI.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">5. Báo cáo và xử lý vi phạm</h2>
          <p className="text-muted-foreground">
            Vi phạm có thể được báo cáo qua các kênh kiểm duyệt của nền tảng. Hình thức xử lý có thể bao gồm cảnh báo,
            giới hạn tính năng, tạm khóa hoặc xóa tài khoản vĩnh viễn.
          </p>
        </div>
      </section>

      <Separator className="my-6" />

      <p className="text-sm text-muted-foreground">
        Liên quan:{' '}
        <Link href="/legal/terms-of-service" className="text-primary hover:underline">
          Điều khoản dịch vụ
        </Link>{' '}
        và{' '}
        <Link href="/legal/user-policy" className="text-primary hover:underline">
          Chính sách người dùng
        </Link>
      </p>
    </article>
  );
}
