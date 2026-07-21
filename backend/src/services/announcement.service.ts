import { Types } from "mongoose";
import type { CreateAnnouncementDTO } from "../dtos/announcement.dto";
import { HttpException } from "../exceptions/http-exception";
import type { IAnnouncement } from "../models/announcement.model";
import { AnnouncementMongoRepository } from "../repositories/announcement.repository";
import type {
  AnnouncementAudience,
  AnnouncementRecipientRole,
} from "../types/announcement.type";

const announcementRepository = new AnnouncementMongoRepository();

export type SafeAnnouncement = {
  id: string;
  title: string;
  message: string;
  audience: AnnouncementAudience;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export class AnnouncementService {
  private sanitize(announcement: IAnnouncement): SafeAnnouncement {
    return {
      id: announcement._id.toString(),
      title: announcement.title,
      message: announcement.message,
      audience: announcement.audience,
      createdBy: announcement.createdBy.toString(),
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt,
    };
  }

  async create(
    adminId: string,
    data: CreateAnnouncementDTO,
  ): Promise<SafeAnnouncement> {
    const announcement = await announcementRepository.create({
      ...data,
      createdBy: new Types.ObjectId(adminId),
    });
    return this.sanitize(announcement);
  }

  async listAll(): Promise<SafeAnnouncement[]> {
    const announcements = await announcementRepository.listAll();
    return announcements.map((announcement) => this.sanitize(announcement));
  }

  async listForRole(
    role: AnnouncementRecipientRole,
  ): Promise<SafeAnnouncement[]> {
    const announcements = await announcementRepository.listForRole(role);
    return announcements.map((announcement) => this.sanitize(announcement));
  }

  async delete(id: string): Promise<void> {
    const announcement = await announcementRepository.getById(id);
    if (!announcement) throw new HttpException(404, "Announcement not found");
    await announcementRepository.delete(id);
  }
}
