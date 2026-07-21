import {
  AnnouncementModel,
  type IAnnouncement,
} from "../models/announcement.model";
import type { AnnouncementRecipientRole } from "../types/announcement.type";

export class AnnouncementMongoRepository {
  create(data: Partial<IAnnouncement>): Promise<IAnnouncement> {
    return AnnouncementModel.create(data);
  }

  listAll(): Promise<IAnnouncement[]> {
    return AnnouncementModel.find({}).sort({ createdAt: -1 });
  }

  listForRole(role: AnnouncementRecipientRole): Promise<IAnnouncement[]> {
    return AnnouncementModel.find({ audience: { $in: [role, "all"] } }).sort({
      createdAt: -1,
    });
  }

  getById(id: string): Promise<IAnnouncement | null> {
    return AnnouncementModel.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await AnnouncementModel.findByIdAndDelete(id);
    return Boolean(deleted);
  }
}
