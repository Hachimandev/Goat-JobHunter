import type { Metadata } from 'next';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Điều khoản dịch vụ | GOAT Job Hunter',
  description: 'Điều khoản dịch vụ cho nền tảng mạng xã hội, trò chuyện và việc làm GOAT Job Hunter.',
};

export default function TermsOfServicePage() {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <header>
        <h1 className="mt-2 text-3xl font-bold text-foreground">Điều khoản dịch vụ</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Khi sử dụng GOAT Job Hunter, bạn đồng ý với các điều khoản áp dụng cho hoạt động tương tác xã hội, kết nối
          nghề nghiệp và tuyển dụng.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Ngày hiệu lực: 2026-04-16</p>
      </header>

      <Separator className="my-6" />

      <section className="space-y-6 text-sm leading-6 text-foreground">
        <div>
          <h2 className="text-lg font-semibold">1. Điều kiện tài khoản và trách nhiệm</h2>
          <p>
            Bạn phải cung cấp thông tin đăng ký chính xác, duy trì bảo mật tài khoản và không chia sẻ thông tin đăng
            nhập cho bên không được phép.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Mỗi người dùng cần sử dụng danh tính trung thực cho mục đích cá nhân.</li>
            <li>Tài khoản nhà tuyển dụng và công ty phải đại diện cho tổ chức hợp pháp.</li>
            <li>Bạn chịu trách nhiệm với mọi hoạt động phát sinh từ tài khoản của mình.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">2. Tính minh bạch trong tuyển dụng</h2>
          <p>
            Tin tuyển dụng, trao đổi phỏng vấn và đánh giá ứng viên phải công bằng, đúng pháp luật và không gây hiểu
            nhầm.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Không đăng tin tuyển dụng giả, mô tả lương thưởng sai lệch hoặc ẩn phí.</li>
            <li>Không yêu cầu ứng viên thanh toán các khoản trái pháp luật.</li>
            <li>Không thực hiện hành vi phân biệt đối xử trái với quy định pháp luật hiện hành.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">3. Sử dụng chat và nội dung media</h2>
          <p>
            Hoạt động nhắn tin phải tôn trọng, an toàn và hợp pháp. Người dùng không được phát tán mã độc, nội dung lạm
            dụng hoặc dữ liệu cá nhân thu thập khi chưa có sự đồng ý.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Không quấy rối, đe dọa hoặc liên hệ làm phiền nhiều lần ngoài mong muốn.</li>
            <li>Không gửi tệp độc hại, liên kết lừa đảo hoặc tải lên nội dung media không an toàn.</li>
            <li>Không mạo danh ứng viên, nhà tuyển dụng, công ty hoặc quản trị viên.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">4. Sử dụng trợ lý AI</h2>
          <p>
            Tính năng AI chỉ mang tính hỗ trợ thông tin và không được dùng cho mục đích lạm dụng, gian lận hoặc tự động
            hóa gây hại.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Phản hồi từ AI không phải là tư vấn pháp lý, tài chính hoặc y tế.</li>
            <li>Người dùng tự chịu trách nhiệm với quyết định dựa trên gợi ý từ AI.</li>
            <li>Prompt lạm dụng hoặc sử dụng đầu ra AI sai mục đích có thể bị xử lý.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">5. Cơ chế xử lý và giới hạn dịch vụ</h2>
          <p>
            GOAT có thể cảnh báo, giới hạn tính năng, tạm khóa hoặc chấm dứt tài khoản nếu vi phạm chính sách hoặc gây
            rủi ro bảo mật. Khả năng cung cấp dịch vụ có thể thay đổi do bảo trì hoặc yêu cầu tuân thủ pháp lý.
          </p>
        </div>
      </section>

      <Separator className="my-6" />

      <p className="text-sm text-muted-foreground">
        Liên quan:{' '}
        <Link href="/legal/user-policy" className="text-primary hover:underline">
          Chính sách người dùng
        </Link>{' '}
        và{' '}
        <Link href="/legal/community-standards" className="text-primary hover:underline">
          Tiêu chuẩn cộng đồng
        </Link>
      </p>
    </article>
  );
}
