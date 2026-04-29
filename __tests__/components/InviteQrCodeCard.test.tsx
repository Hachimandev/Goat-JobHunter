import { render } from "@testing-library/react-native";
import { InviteQrCodeCard } from "@/components/chat/InviteQrCodeCard";

describe("InviteQrCodeCard", () => {
  it("renders qr section when invite link exists", () => {
    const { queryByText } = render(
      <InviteQrCodeCard inviteLink="https://goatjobhunter.com/invite/abc" />
    );
    expect(queryByText(/mã QR tham gia/i)).toBeTruthy();
  });

  it("renders without crashing with valid link", () => {
    const { toJSON } = render(
      <InviteQrCodeCard inviteLink="https://goatjobhunter.com/invite/test123" />
    );
    expect(toJSON()).not.toBeNull();
  });
});
