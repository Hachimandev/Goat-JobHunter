import { NextResponse, NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";

export default function proxy(req: NextRequest) {
  const res = NextResponse.next();

  let guestId = req.cookies.get("guestId")?.value;

  if (!guestId) {
    guestId = uuidv4();

    res.cookies.set("guestId", guestId, {
      httpOnly: false,            // FE có thể đọc
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 60 * 24 * 365, // 1 năm
    });

    // Người thật thường dùng 1 thiết bị rất lâu → duy trì được hành vi
    //
    // Không bị reset mỗi lần user đóng trình duyệt
    //
    // Giảm việc tạo quá nhiều guestId → lưu trữ Redis/DB tối ưu hơn
    //
    // Bạn tracking được unique view tốt hơn
  }

  return res;
}

export const config = {
  matcher: "/:path*",  // chạy cho toàn bộ route
};
