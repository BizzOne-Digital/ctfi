import { connectToDatabase } from "./db";
import AppointmentModel from "@/models/Appointment";
import ServiceModel from "@/models/Service";
import ClientGalleryModel from "@/models/ClientGallery";
import GalleryImageModel from "@/models/GalleryImage";
import ContactMessageModel from "@/models/ContactMessage";
import MediaModel from "@/models/Media";

function serialize<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

export interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  totalServices: number;
  totalGalleries: number;
  totalImages: number;
  unreadMessages: number;
  recentAppointments: {
    _id: string;
    fullName: string;
    serviceName: string;
    preferredDate: string;
    preferredTime: string;
    status: string;
  }[];
  recentMessages: { _id: string; name: string; subject: string; status: string; createdAt: string }[];
  recentGalleries: { _id: string; name: string; clientName: string; createdAt: string }[];
}

const EMPTY_STATS: DashboardStats = {
  totalAppointments: 0,
  pendingAppointments: 0,
  totalServices: 0,
  totalGalleries: 0,
  totalImages: 0,
  unreadMessages: 0,
  recentAppointments: [],
  recentMessages: [],
  recentGalleries: [],
};

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    await connectToDatabase();

    const [
      totalAppointments,
      pendingAppointments,
      totalServices,
      totalGalleries,
      totalImages,
      unreadMessages,
      recentAppointments,
      recentMessages,
      recentGalleries,
    ] = await Promise.all([
      AppointmentModel.countDocuments(),
      AppointmentModel.countDocuments({ status: "pending" }),
      ServiceModel.countDocuments(),
      ClientGalleryModel.countDocuments(),
      MediaModel.countDocuments(),
      ContactMessageModel.countDocuments({ status: "unread" }),
      AppointmentModel.find().sort({ createdAt: -1 }).limit(5).lean(),
      ContactMessageModel.find().sort({ createdAt: -1 }).limit(5).lean(),
      ClientGalleryModel.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    return serialize({
      totalAppointments,
      pendingAppointments,
      totalServices,
      totalGalleries,
      totalImages,
      unreadMessages,
      recentAppointments: recentAppointments.map((a) => ({
        _id: String(a._id),
        fullName: a.fullName,
        serviceName: a.serviceName,
        preferredDate: new Date(a.preferredDate).toISOString(),
        preferredTime: a.preferredTime,
        status: a.status as string,
      })),
      recentMessages: recentMessages.map((m) => ({
        _id: String(m._id),
        name: m.name,
        subject: m.subject,
        status: m.status as string,
        createdAt: new Date(m.createdAt).toISOString(),
      })),
      recentGalleries: recentGalleries.map((g) => ({
        _id: String(g._id),
        name: g.name,
        clientName: g.clientName,
        createdAt: new Date(g.createdAt).toISOString(),
      })),
    });
  } catch (err) {
    console.error("Dashboard stats failed", err);
    return EMPTY_STATS;
  }
}

export { GalleryImageModel };
