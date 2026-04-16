import type { Metadata } from 'next';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Chính sách người dùng | GOAT Job Hunter',
  description: 'Chính sách dữ liệu và quyền riêng tư cho các tính năng mạng xã hội, trò chuyện và việc làm.',
};

export default function UserPolicyPage() {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Tài liệu pháp lý</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Chính sách người dùng</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Chính sách này mô tả cách GOAT Job Hunter xử lý dữ liệu cá nhân trong các hoạt động tương tác xã hội, nhắn
          tin, ứng tuyển, phỏng vấn và giao tiếp giữa doanh nghiệp với người dùng.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Ngày hiệu lực: 2026-04-16</p>
      </header>

      <Separator className="my-6" />

      <section className="space-y-6 text-sm leading-6 text-foreground">
        <div>
          <h2 className="text-lg font-semibold">1. Dữ liệu chúng tôi thu thập</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Dữ liệu tài khoản: họ tên, email, ảnh hồ sơ và bản ghi xác thực.</li>
            <li>Dữ liệu nghề nghiệp: CV, kỹ năng, hồ sơ ứng tuyển, lịch phỏng vấn và trạng thái liên quan.</li>
            <li>Dữ liệu tương tác: tin nhắn, tệp media, cảm xúc, bình luận và thông báo.</li>
            <li>Dữ liệu bảo mật: định danh thiết bị, cookie phiên và nhật ký phòng chống lạm dụng.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">2. Mục đích xử lý dữ liệu</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Cung cấp các tính năng việc làm và nhắn tin theo nhu cầu người dùng.</li>
            <li>Bảo vệ người dùng trước hành vi lừa đảo, mạo danh, quấy rối và lạm dụng tài khoản.</li>
            <li>Nâng cao chất lượng sản phẩm, độ phù hợp gợi ý và độ ổn định nền tảng.</li>
            <li>Thực hiện nghĩa vụ pháp lý liên quan đến tuân thủ, bảo mật và yêu cầu của cơ quan có thẩm quyền.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">3. Quy tắc chia sẻ và hiển thị</h2>
          <p className="text-muted-foreground">
            Chúng tôi chỉ chia sẻ mức dữ liệu tối thiểu cần thiết giữa ứng viên, nhà tuyển dụng và doanh nghiệp dựa trên
            hành động của người dùng và tùy chọn hiển thị.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Cài đặt hiển thị hồ sơ quyết định ai có thể tìm thấy và liên hệ với bạn.</li>
            <li>
              Dữ liệu ứng tuyển chỉ được chia sẻ với nhà tuyển dụng mục tiêu và tài khoản doanh nghiệp được ủy quyền.
            </li>
            <li>Đội ngũ kiểm duyệt có thể truy cập nội dung báo cáo để phục vụ quá trình xử lý vi phạm.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">4. Lưu trữ và bảo mật</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              Dữ liệu chỉ được lưu trữ trong thời gian cần thiết cho vận hành, nghĩa vụ pháp lý và xử lý tranh chấp.
            </li>
            <li>Mã hóa truyền tải, kiểm soát truy cập và giám sát hệ thống giúp bảo vệ dữ liệu người dùng.</li>
            <li>Người dùng cần bảo mật thông tin đăng nhập và áp dụng thực hành an toàn cho tài khoản.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">5. Quyền của người dùng</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Yêu cầu truy cập dữ liệu cá nhân và cập nhật thông tin hồ sơ chưa chính xác.</li>
            <li>Yêu cầu xóa hoặc hạn chế xử lý dữ liệu theo điều kiện pháp luật áp dụng.</li>
            <li>Quản lý tùy chọn liên lạc và hiển thị trong phần cài đặt tài khoản.</li>
          </ul>
        </div>
      </section>

      <Separator className="my-6" />

      <p className="text-sm text-muted-foreground">
        Liên quan:{' '}
        <Link href="/legal/terms-of-service" className="text-primary hover:underline">
          Điều khoản dịch vụ
        </Link>{' '}
        và{' '}
        <Link href="/legal/community-standards" className="text-primary hover:underline">
          Tiêu chuẩn cộng đồng
        </Link>
      </p>
    </article>
  );
}
