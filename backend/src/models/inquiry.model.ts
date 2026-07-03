import { Document, Schema, model } from "mongoose";
import {
  INQUIRY_CATEGORIES,
  INQUIRY_STATUSES,
  type InquiryCategory,
  type InquiryStatus,
} from "../types/inquiry.type";

export interface IInquiry extends Document {
  fullName: string;
  email: string;
  subject: string;
  message: string;
  category: InquiryCategory;
  status: InquiryStatus;
  adminNote: string;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    category: {
      type: String,
      enum: INQUIRY_CATEGORIES,
      required: true,
      default: "general",
    },
    status: {
      type: String,
      enum: INQUIRY_STATUSES,
      required: true,
      default: "new",
    },
    adminNote: { type: String, trim: true, maxlength: 2000, default: "" },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

InquirySchema.index({ createdAt: -1 });
InquirySchema.index({ status: 1, createdAt: -1 });
InquirySchema.index({ email: 1 });

export const InquiryModel = model<IInquiry>("Inquiry", InquirySchema);
