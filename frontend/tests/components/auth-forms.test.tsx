import type { ComponentProps, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { FieldError } from "@/components/auth/FieldError";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import PasswordUpdateForm from "@/components/profile/PasswordUpdateForm";

vi.mock("@/actions/auth.actions", () => ({
  forgotPasswordAction: vi.fn(),
  loginAction: vi.fn(),
  registerAction: vi.fn(),
  resetPasswordAction: vi.fn(),
  updatePasswordAction: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a"> & { children: ReactNode }) => (
    <a href={typeof href === "string" ? href : "#"} {...props}>
      {children}
    </a>
  ),
}));

describe("authentication and account forms", () => {
  test("omits an empty field error", () => {
    const { container } = render(<FieldError />);
    expect(container).toBeEmptyDOMElement();
  });

  test("shows the first field validation error", () => {
    render(<FieldError errors={["Email is required", "Email is invalid"]} />);
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.queryByText("Email is invalid")).not.toBeInTheDocument();
  });

  test("renders login fields with the requested role", () => {
    const { container } = render(<LoginForm role="Driver" />);
    expect(screen.getByLabelText("Email Address")).toBeRequired();
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(container.querySelector('input[name="role"]')).toHaveValue("Driver");
  });

  test("toggles password visibility on login", async () => {
    const { container } = render(<LoginForm />);
    const password = screen.getByLabelText("Password");
    const toggle = container.querySelector('button[type="button"]');
    expect(toggle).not.toBeNull();
    await userEvent.click(toggle!);
    expect(password).toHaveAttribute("type", "text");
  });

  test("renders every customer registration field", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText("Full Name")).toBeRequired();
    expect(screen.getByLabelText("Phone Number")).toBeRequired();
    expect(screen.getByLabelText("Work Email")).toBeRequired();
    expect(screen.getByLabelText("Password")).toHaveAttribute("minlength", "6");
    expect(screen.getByRole("progressbar", { name: "Password strength" })).toHaveAttribute(
      "aria-valuenow",
      "0",
    );
    expect(screen.getByRole("button", { name: "Create Account" })).toBeEnabled();
  });

  test("updates the registration password strength as recommendations are met", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const password = screen.getByLabelText("Password");
    const meter = screen.getByRole("progressbar", { name: "Password strength" });

    await user.type(password, "abc");
    expect(screen.getByText("Weak")).toBeInTheDocument();
    expect(meter).toHaveAttribute("aria-valuenow", "1");

    await user.clear(password);
    await user.type(password, "Abcdef1!");
    expect(screen.getByText("Strong")).toBeInTheDocument();
    expect(meter).toHaveAttribute("aria-valuenow", "4");
    expect(meter).toHaveAttribute("aria-valuetext", "Strong");
  });

  test("renders the forgot-password request and sign-in link", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByLabelText("Email Address")).toBeRequired();
    expect(screen.getByRole("button", { name: "Send Reset Link" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "Back to Sign In" })).toHaveAttribute("href", "/login");
  });

  test("rejects a reset form without a token", () => {
    render(<ResetPasswordForm token="" />);
    expect(screen.getByText(/invalid or has expired/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request a new link" })).toHaveAttribute("href", "/forgot-password");
  });

  test("shows both reset passwords when requested", async () => {
    render(<ResetPasswordForm token="valid-token" />);
    const newPassword = screen.getByLabelText("New Password");
    const confirmPassword = screen.getByLabelText("Confirm Password");
    await userEvent.click(screen.getByRole("checkbox", { name: "Show password" }));
    expect(newPassword).toHaveAttribute("type", "text");
    expect(confirmPassword).toHaveAttribute("type", "text");
  });

  test("renders the signed-in password update form", () => {
    render(<PasswordUpdateForm />);
    expect(screen.getByLabelText("New Password")).toHaveAttribute("minlength", "6");
    expect(screen.getByLabelText("Confirm New Password")).toBeRequired();
    expect(screen.getByRole("button", { name: "Update Password" })).toBeEnabled();
  });
});
