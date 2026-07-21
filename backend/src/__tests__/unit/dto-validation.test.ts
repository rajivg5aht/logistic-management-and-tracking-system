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
  test("user registration accepts a complete valid account", () => {
    expect(CreateUserDTO.safeParse(validUser).success).toBe(true);
  });

  test("user registration rejects an invalid email address", () => {
    expect(
      CreateUserDTO.safeParse({ ...validUser, email: "not-an-email" }).success,
    ).toBe(false);
  });

  test("user registration rejects a short phone number", () => {
    expect(
      CreateUserDTO.safeParse({ ...validUser, phoneNumber: "9800" }).success,
    ).toBe(false);
  });

  test("login accepts a valid email and password", () => {
    expect(
      LoginUserDTO.safeParse({ email: validUser.email, password: validUser.password })
        .success,
    ).toBe(true);
  });

  test("profile updates reject an invalid replacement email", () => {
    expect(UpdateUserDTO.safeParse({ email: "invalid" }).success).toBe(false);
  });

  test("forgot-password requests require a valid email", () => {
    expect(ForgotPasswordDTO.safeParse({ email: "missing-at-sign" }).success).toBe(
      false,
    );
  });

  test("password resets accept a six-character replacement", () => {
    expect(ResetPasswordDTO.safeParse({ newPassword: "123456" }).success).toBe(
      true,
    );
  });

  test("assistant messages trim surrounding whitespace", () => {
    const result = AssistantMessageDTO.parse({
      role: "user",
      content: "  Track my parcel  ",
    });

    expect(result.content).toBe("Track my parcel");
  });

  test("assistant messages reject whitespace-only content", () => {
    expect(
      AssistantMessageDTO.safeParse({ role: "user", content: "   " }).success,
    ).toBe(false);
  });

  test("assistant chat accepts the twelve-message limit", () => {
    const messages = Array.from({ length: 12 }, (_, index) => ({
      role: "user" as const,
      content: `Message ${index + 1}`,
    }));

    expect(AssistantChatDTO.safeParse({ messages }).success).toBe(true);
  });

  test("assistant chat rejects more than twelve messages", () => {
    const messages = Array.from({ length: 13 }, (_, index) => ({
      role: "user" as const,
      content: `Message ${index + 1}`,
    }));

    expect(AssistantChatDTO.safeParse({ messages }).success).toBe(false);
  });

  test("assistant chat requires the user to send the final message", () => {
    expect(
      AssistantChatDTO.safeParse({
        messages: [{ role: "assistant", content: "How can I help?" }],
      }).success,
    ).toBe(false);
  });

  test("public inquiries accept valid contact details", () => {
    expect(
      CreateInquiryDTO.safeParse({
        fullName: "Laxmi Rai",
        email: "laxmi@example.com",
        subject: "Parcel delay",
        message: "Please help me locate my delayed parcel.",
      }).success,
    ).toBe(true);
  });

  test("public inquiries reject messages shorter than ten characters", () => {
    expect(
      CreateInquiryDTO.safeParse({
        fullName: "Laxmi Rai",
        email: "laxmi@example.com",
        subject: "Delay",
        message: "Too short",
      }).success,
    ).toBe(false);
  });

  test("admin inquiry updates require at least one field", () => {
    expect(AdminUpdateInquiryDTO.safeParse({}).success).toBe(false);
  });

  test("announcements accept a valid audience and content", () => {
    expect(
      CreateAnnouncementDTO.safeParse({
        title: "Service update",
        message: "Deliveries will resume after the public holiday.",
        audience: "all",
      }).success,
    ).toBe(true);
  });

  test("announcements reject titles shorter than three characters", () => {
    expect(
      CreateAnnouncementDTO.safeParse({
        title: "Hi",
        message: "This message is long enough.",
        audience: "all",
      }).success,
    ).toBe(false);
  });

  test("refund requests accept a shipment and positive partial amount", () => {
    const result = AdminRefundDTO.safeParse({
      shipmentId: "shipment-1",
      amount: 250,
    });

    expect(result.success).toBe(true);
  });

  test("refund requests reject a zero amount", () => {
    expect(
      AdminRefundDTO.safeParse({ shipmentId: "shipment-1", amount: 0 }).success,
    ).toBe(false);
  });

  test("cash settlement notes are trimmed", () => {
    expect(AdminSettleCodDTO.parse({ notes: "  Received at office  " }).notes).toBe(
      "Received at office",
    );
  });
});
