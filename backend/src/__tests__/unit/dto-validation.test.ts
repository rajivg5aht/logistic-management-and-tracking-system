import {
  CreateUserDTO,
  ForgotPasswordDTO,
  LoginUserDTO,
  ResetPasswordDTO,
  UpdateUserDTO,
} from "../../dtos/user.dto";
import {
  AssistantChatDTO,
  AssistantMessageDTO,
} from "../../dtos/assistant.dto";
import {
  AdminUpdateInquiryDTO,
  CreateInquiryDTO,
} from "../../dtos/inquiry.dto";
import { CreateAnnouncementDTO } from "../../dtos/announcement.dto";
import { AdminRefundDTO, AdminSettleCodDTO } from "../../dtos/payment.dto";

const validUser = {
  fullName: "Ram Thapa",
  email: "ram@example.com",
  phoneNumber: "9800000000",
  password: "secret1",
};

describe("Unit: request DTO validation", () => {
  test("validates registration and login account boundaries", () => {
    expect(CreateUserDTO.safeParse(validUser).success).toBe(true);
    expect(
      CreateUserDTO.safeParse({ ...validUser, email: "not-an-email" }).success,
    ).toBe(false);
    expect(
      CreateUserDTO.safeParse({ ...validUser, phoneNumber: "9800" }).success,
    ).toBe(false);
    expect(
      LoginUserDTO.safeParse({
        email: validUser.email,
        password: validUser.password,
      }).success,
    ).toBe(true);
  });

  test("validates profile and password recovery boundaries", () => {
    expect(UpdateUserDTO.safeParse({ email: "invalid" }).success).toBe(false);
    expect(
      UpdateUserDTO.safeParse({ password: "new-secret" }).success,
    ).toBe(false);
    expect(ForgotPasswordDTO.safeParse({ email: "missing-at-sign" }).success).toBe(
      false,
    );
    expect(ResetPasswordDTO.safeParse({ newPassword: "123456" }).success).toBe(
      true,
    );
  });

  test("trims assistant messages and rejects blank content", () => {
    const result = AssistantMessageDTO.parse({
      role: "user",
      content: "  Track my parcel  ",
    });
    expect(result.content).toBe("Track my parcel");
    expect(
      AssistantMessageDTO.safeParse({ role: "user", content: "   " }).success,
    ).toBe(false);
  });

  test("enforces assistant conversation length and final-message rules", () => {
    const twelveMessages = Array.from({ length: 12 }, (_, index) => ({
      role: "user" as const,
      content: `Message ${index + 1}`,
    }));
    const thirteenMessages = Array.from({ length: 13 }, (_, index) => ({
      role: "user" as const,
      content: `Message ${index + 1}`,
    }));
    expect(AssistantChatDTO.safeParse({ messages: twelveMessages }).success).toBe(
      true,
    );
    expect(
      AssistantChatDTO.safeParse({ messages: thirteenMessages }).success,
    ).toBe(false);
    expect(
      AssistantChatDTO.safeParse({
        messages: [{ role: "assistant", content: "How can I help?" }],
      }).success,
    ).toBe(false);
  });

  test("validates public and administrative inquiry boundaries", () => {
    const base = {
      fullName: "Laxmi Rai",
      email: "laxmi@example.com",
      subject: "Parcel delay",
      message: "Please help me locate my delayed parcel.",
    };
    expect(CreateInquiryDTO.safeParse(base).success).toBe(true);
    expect(CreateInquiryDTO.safeParse({ ...base, message: "Too short" }).success).toBe(
      false,
    );
    expect(AdminUpdateInquiryDTO.safeParse({}).success).toBe(false);
  });

  test("validates announcement titles, audiences, and content", () => {
    const base = {
      title: "Service update",
      message: "Deliveries will resume after the public holiday.",
      audience: "all" as const,
    };
    expect(CreateAnnouncementDTO.safeParse(base).success).toBe(true);
    expect(
      CreateAnnouncementDTO.safeParse({ ...base, title: "Hi" }).success,
    ).toBe(false);
  });

  test("validates refund amounts and trims cash settlement notes", () => {
    expect(
      AdminRefundDTO.safeParse({ shipmentId: "shipment-1", amount: 250 }).success,
    ).toBe(true);
    expect(
      AdminRefundDTO.safeParse({ shipmentId: "shipment-1", amount: 0 }).success,
    ).toBe(false);
    expect(AdminSettleCodDTO.parse({ notes: "  Received at office  " }).notes).toBe(
      "Received at office",
    );
  });
});
