import type {
  AdminUpdateInquiryDTO,
  CreateCustomerInquiryDTO,
  CreateInquiryDTO,
} from "../dtos/inquiry.dto";
import { HttpException } from "../exceptions/http-exception";
import type { IInquiry } from "../models/inquiry.model";
import {
  InquiryMongoRepository,
  type InquiryFilters,
  type InquiryStats,
} from "../repositories/inquiry.repository";
import { UserMongoRepository } from "../repositories/user.repository";
import type { InquiryCategory } from "../types/inquiry.type";

const inquiryRepository = new InquiryMongoRepository();
const userRepository = new UserMongoRepository();

export type SafeInquiry = {
  id: string;
  customer: string | null;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  category: IInquiry["category"];
  status: IInquiry["status"];
  adminNote: string;
  adminReply: string;
  repliedAt: Date | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class InquiryService {
  private sanitize(inquiry: IInquiry): SafeInquiry {
    return {
      id: inquiry._id.toString(),
      customer: inquiry.customer?.toString() ?? null,
      fullName: inquiry.fullName,
      email: inquiry.email,
      subject: inquiry.subject,
      message: inquiry.message,
      category: inquiry.category,
      status: inquiry.status,
      adminNote: inquiry.adminNote || "",
      adminReply: inquiry.adminReply || "",
      repliedAt: inquiry.repliedAt ?? null,
      resolvedAt: inquiry.resolvedAt ?? null,
      createdAt: inquiry.createdAt,
      updatedAt: inquiry.updatedAt,
    };
  }

  private categoryForSubject(subject: string): InquiryCategory {
    const normalized = subject.toLowerCase();
    if (normalized.includes("support") || normalized.includes("complaint")) return "support";
    if (normalized.includes("business") || normalized.includes("partnership")) return "sales";
    return "general";
  }

  async create(data: CreateInquiryDTO): Promise<SafeInquiry> {
    const inquiry = await inquiryRepository.create({
      ...data,
      customer: null,
      category: this.categoryForSubject(data.subject),
      status: "new",
      adminNote: "",
      adminReply: "",
      repliedAt: null,
      resolvedAt: null,
    });
    return this.sanitize(inquiry);
  }

  async list(
    page: number,
    limit: number,
    filters: InquiryFilters,
  ): Promise<{ inquiries: SafeInquiry[]; total: number }> {
    const result = await inquiryRepository.getPaginated(page, limit, filters);
    return {
      inquiries: result.inquiries.map((inquiry) => this.sanitize(inquiry)),
      total: result.total,
    };
  }

  async createForCustomer(
    customerId: string,
    data: CreateCustomerInquiryDTO,
  ): Promise<SafeInquiry> {
    const user = await userRepository.getUserById(customerId);
    if (!user) throw new HttpException(404, "Customer account not found");

    const inquiry = await inquiryRepository.create({
      customer: user._id,
      fullName: user.fullName,
      email: user.email,
      subject: data.subject,
      message: data.message,
      category: this.categoryForSubject(data.subject),
      status: "new",
      adminNote: "",
      adminReply: "",
      repliedAt: null,
      resolvedAt: null,
    });
    return this.sanitize(inquiry);
  }

  async listByCustomer(customerId: string, email: string): Promise<SafeInquiry[]> {
    const inquiries = await inquiryRepository.getByCustomerOrEmail(customerId, email);
    return inquiries.map((inquiry) => this.sanitize(inquiry));
  }

  async getById(id: string): Promise<SafeInquiry> {
    const inquiry = await inquiryRepository.getById(id);
    if (!inquiry) throw new HttpException(404, "Inquiry not found");
    return this.sanitize(inquiry);
  }

  async update(id: string, data: AdminUpdateInquiryDTO): Promise<SafeInquiry> {
    const current = await inquiryRepository.getById(id);
    if (!current) throw new HttpException(404, "Inquiry not found");

    const updateData: Partial<IInquiry> = { ...data };
    if (data.adminReply !== undefined) {
      updateData.repliedAt = data.adminReply ? new Date() : null;
    }
    if (data.status === "resolved" && current.status !== "resolved") {
      updateData.resolvedAt = new Date();
    } else if (data.status && data.status !== "resolved") {
      updateData.resolvedAt = null;
    }

    const updated = await inquiryRepository.update(id, updateData);
    if (!updated) throw new HttpException(500, "Failed to update inquiry");
    return this.sanitize(updated);
  }

  async delete(id: string): Promise<void> {
    const exists = await inquiryRepository.getById(id);
    if (!exists) throw new HttpException(404, "Inquiry not found");
    await inquiryRepository.delete(id);
  }

  getStats(): Promise<InquiryStats> {
    return inquiryRepository.getStats();
  }
}
