import { Document, Schema, Types, model } from "mongoose";
import {
  ANNOUNCEMENT_AUDIENCES,
  type AnnouncementAudience,
} from "../types/announcement.type";

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  audience: AnnouncementAudience;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    audience: {
      type: String,
      enum: ANNOUNCEMENT_AUDIENCES,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

AnnouncementSchema.index({ audience: 1, createdAt: -1 });
AnnouncementSchema.index({ createdAt: -1 });

export const AnnouncementModel = model<IAnnouncement>(
  "Announcement",
  AnnouncementSchema,
);
