import { InquiryModel, type IInquiry } from "../models/inquiry.model";
import type { InquiryCategory, InquiryStatus } from "../types/inquiry.type";

export type InquiryStats = {
  total: number;
  pending: number;
  resolved: number;
  newToday: number;
  resolvedRate: number;
};

export type InquiryFilters = {
  search?: string;
  status?: InquiryStatus;
  category?: InquiryCategory;
  sort?: "newest" | "oldest";
};

export class InquiryMongoRepository {
  create(data: Partial<IInquiry>): Promise<IInquiry> {
    return InquiryModel.create(data);
  }

  getById(id: string): Promise<IInquiry | null> {
    return InquiryModel.findById(id);
  }

  update(id: string, data: Partial<IInquiry>): Promise<IInquiry | null> {
    return InquiryModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await InquiryModel.findByIdAndDelete(id);
    return Boolean(deleted);
  }

  async getPaginated(
    page: number,
    limit: number,
    filters: InquiryFilters,
  ): Promise<{ inquiries: IInquiry[]; total: number }> {
    const query: Record<string, unknown> = {};

    if (filters.status) query.status = filters.status;
    if (filters.category) query.category = filters.category;
    if (filters.search) {
      const pattern = { $regex: filters.search, $options: "i" };
      query.$or = [
        { fullName: pattern },
        { email: pattern },
        { subject: pattern },
        { message: pattern },
      ];
    }

    const [inquiries, total] = await Promise.all([
      InquiryModel.find(query)
        .sort({ createdAt: filters.sort === "oldest" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      InquiryModel.countDocuments(query),
    ]);

    return { inquiries, total };
  }

  async getStats(): Promise<InquiryStats> {
    const nepalOffsetMs = (5 * 60 + 45) * 60 * 1000;
    const nowInNepal = new Date(Date.now() + nepalOffsetMs);
    const todayStart = new Date(
      Date.UTC(
        nowInNepal.getUTCFullYear(),
        nowInNepal.getUTCMonth(),
        nowInNepal.getUTCDate(),
      ) - nepalOffsetMs,
    );
    const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const [total, pending, resolved, newToday] = await Promise.all([
      InquiryModel.countDocuments({}),
      InquiryModel.countDocuments({ status: { $ne: "resolved" } }),
      InquiryModel.countDocuments({ status: "resolved" }),
      InquiryModel.countDocuments({ createdAt: { $gte: todayStart, $lt: tomorrowStart } }),
    ]);

    return {
      total,
      pending,
      resolved,
      newToday,
      resolvedRate: total === 0 ? 0 : Math.round((resolved / total) * 1000) / 10,
    };
  }
}
