import { Document, Schema, Types, model } from "mongoose";
import {
  INQUIRY_CATEGORIES,
  INQUIRY_STATUSES,
  type InquiryCategory,
  type InquiryStatus,
} from "../types/inquiry.type";

export interface IInquiry extends Document {
  customer: Types.ObjectId | null;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  category: InquiryCategory;
  status: InquiryStatus;
  adminNote: string;
  adminReply: string;
  repliedAt: Date | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
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
    adminReply: { type: String, trim: true, maxlength: 4000, default: "" },
    repliedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

InquirySchema.index({ createdAt: -1 });
InquirySchema.index({ status: 1, createdAt: -1 });
InquirySchema.index({ email: 1 });

export const InquiryModel = model<IInquiry>("Inquiry", InquirySchema);
