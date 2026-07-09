import type { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { FRONTEND_ORIGIN, SECRET_KEY } from "../configs/constant";
import { UserModel } from "../models/user.model";
import { TrackingService, TrackingUser } from "../services/tracking.service";

const trackingService = new TrackingService();

let io: Server | null = null;

// Room that scopes location broadcasts to a single shipment.
const roomName = (shipmentId: string): string => `shipment-${shipmentId}`;

// Accepts either a bare id string or a `{ shipmentId }` object from the client.
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

export const initSocketServer = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: FRONTEND_ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authenticate the handshake with the same JWT the REST API uses. The token
  // is expected on `auth.token`, falling back to the Authorization header.
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

    // Viewer (customer/admin/driver) subscribes to a shipment's live location.
    socket.on("join-shipment-room", async (payload) => {
      try {
        const shipmentId = extractShipmentId(payload);
        if (!shipmentId || !mongoose.Types.ObjectId.isValid(shipmentId)) {
          throw { status: 400, message: "Invalid shipment id" };
        }
        await trackingService.assertCanRead(user, shipmentId);
        socket.join(roomName(shipmentId));

        // Seed the newcomer with the latest known position, if any.
        const latest = await trackingService.getLatestLocation(shipmentId);
        if (latest) {
          socket.emit("shipment-location-updated", latest);
        }
      } catch (error) {
        emitError(socket, error);
      }
    });

    // Assigned driver streams a GPS fix; broadcast it to that shipment's room.
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
