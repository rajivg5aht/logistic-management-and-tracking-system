import type { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { CORS_ORIGINS, SECRET_KEY } from "../configs/constant";
import { UserModel } from "../models/user.model";
import { TrackingService, TrackingUser } from "../services/tracking.service";

const trackingService = new TrackingService();

let io: Server | null = null;

const roomName = (shipmentId: string): string => `shipment-${shipmentId}`;
const userRoom = (userId: string): string => `user-${userId}`;
const ADMIN_NOTIFICATIONS_ROOM = "admin-notifications";

export type FleetIssueNotification = {
  incidentId: string;
  vehicleRegistration: string;
  driverName: string;
  createdAt: string;
};

const extractShipmentId = (payload: unknown): string | null => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object") {
    const id = (payload as { shipmentId?: unknown }).shipmentId;
    if (typeof id === "string") return id;
  }
  return null;
};

const emitError = (socket: Socket, error: any): void => {
  socket.emit("tracking-error", {
    status: error?.status || 500,
    message: error?.message || "Tracking error",
  });
};

export const getIO = (): Server | null => io;

export const emitFleetIssueReported = (
  notification: FleetIssueNotification,
): void => {
  io?.to(ADMIN_NOTIFICATIONS_ROOM).emit("fleet-issue-reported", notification);
};

export const emitShipmentUpdated = (shipment: { id: string }): void => {
  io?.to(roomName(shipment.id)).emit("shipment-updated", shipment);
};

export type FleetReportUpdate = {
  type: "fuel-expense" | "incident";
  id: string;
  status: string;
};

export const emitFleetReportUpdated = (
  driverId: string,
  update: FleetReportUpdate,
): void => {
  io?.to(userRoom(driverId)).emit("fleet-report-updated", update);
};

export const initSocketServer = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: CORS_ORIGINS,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const header = socket.handshake.headers.authorization;
      const token =
        (socket.handshake.auth?.token as string | undefined) ||
        (header?.startsWith("Bearer ") ? header.split(" ")[1] : undefined);

      if (!token) {
        return next(new Error("Unauthorized - No token provided"));
      }

      const decoded = jwt.verify(token, SECRET_KEY) as {
        id: string;
        email: string;
        role: string;
      };

      const currentUser = await UserModel.findById(decoded.id).select(
        "_id role status",
      );
      if (!currentUser) {
        return next(new Error("Unauthorized - Account not found"));
      }
      if (currentUser.status === "inactive") {
        return next(new Error("Forbidden - Account is inactive"));
      }

      socket.data.user = {
        id: currentUser._id.toString(),
        role: currentUser.role,
      } satisfies TrackingUser;
      next();
    } catch {
      next(new Error("Unauthorized - Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as TrackingUser;
    socket.join(userRoom(user.id));
    if (user.role === "admin") {
      socket.join(ADMIN_NOTIFICATIONS_ROOM);
    }

    socket.on("join-shipment-room", async (payload) => {
      try {
        const shipmentId = extractShipmentId(payload);
        if (!shipmentId || !mongoose.Types.ObjectId.isValid(shipmentId)) {
          throw { status: 400, message: "Invalid shipment id" };
        }
        await trackingService.assertCanRead(user, shipmentId);
        socket.join(roomName(shipmentId));

        const latest = await trackingService.getLatestLocation(shipmentId);
        if (latest) {
          socket.emit("shipment-location-updated", latest);
        }
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on("driver-location-update", async (payload) => {
      try {
        const shipmentId = extractShipmentId(payload);
        if (!shipmentId || !mongoose.Types.ObjectId.isValid(shipmentId)) {
          throw { status: 400, message: "Invalid shipment id" };
        }
        const location = await trackingService.saveDriverLocation(
          user,
          payload,
        );
        io?.to(roomName(shipmentId)).emit("shipment-location-updated", location);
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on("driver-location-stop", async (payload) => {
      try {
        const shipmentId = extractShipmentId(payload);
        if (!shipmentId || !mongoose.Types.ObjectId.isValid(shipmentId)) {
          throw { status: 400, message: "Invalid shipment id" };
        }
        const status = await trackingService.stopDriverLocation(
          user,
          shipmentId,
        );
        io?.to(roomName(shipmentId)).emit("shipment-location-stopped", status);
      } catch (error) {
        emitError(socket, error);
      }
    });

    socket.on("leave-shipment-room", (payload) => {
      const shipmentId = extractShipmentId(payload);
      if (shipmentId) {
        socket.leave(roomName(shipmentId));
      }
    });
  });

  return io;
};
